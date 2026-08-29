/*
 * Service worker: does every network call and hands the content script a
 * finished list of destination links.
 */
/* global importScripts */
importScripts(
  '../common/services.js',
  '../common/normalize.js',
  '../common/settings.js',
  './resolvers.js'
);

const { SERVICES, pickBest, searchQuery, resolvers } = globalThis.OMI;

/* Content scripts are "untrusted contexts" and cannot touch storage.session
 * unless we widen the access level from here. Used both for the lookup cache
 * below and to remember which banners the user dismissed. */
try {
  chrome.storage.session.setAccessLevel({ accessLevel: 'TRUSTED_AND_UNTRUSTED_CONTEXTS' });
} catch (e) {
  /* older Chrome without setAccessLevel: dismissals simply will not persist */
}

/*
 * Lookup cache, in chrome.storage.session rather than a Map.
 *
 * Chrome tears the service worker down after ~30s idle, which took an
 * in-memory cache with it — so in practice it only ever helped inside a single
 * burst of requests, and every new album page paid for a fresh round trip.
 * storage.session survives worker restarts and is cleared when the browser
 * closes, which is exactly the lifetime this cache wants.
 *
 * One key per entry, so parallel writes cannot clobber each other. No size cap:
 * entries are a few hundred bytes against a 10MB budget, they expire by TTL on
 * read, and the whole store is discarded when the browser closes.
 */
const CACHE_PREFIX = 'lookup:';
const CACHE_TTL_MS = 60 * 60 * 1000;

async function cacheGet(key) {
  const storageKey = CACHE_PREFIX + key;
  let stored;
  try {
    stored = await chrome.storage.session.get(storageKey);
  } catch (e) {
    return undefined;
  }
  const hit = stored && stored[storageKey];
  if (!hit) return undefined;
  if (Date.now() - hit.at > CACHE_TTL_MS) {
    try {
      await chrome.storage.session.remove(storageKey);
    } catch (e) {
      /* nothing to do — the TTL check above already rejected it */
    }
    return undefined;
  }
  return hit.value;
}

async function cacheSet(key, value) {
  try {
    await chrome.storage.session.set({ [CACHE_PREFIX + key]: { at: Date.now(), value } });
  } catch (e) {
    /* a cache write failing is not worth surfacing; the lookup already worked */
  }
}

/*
 * Resolve one destination service.
 * Returns { serviceId, url, kind: 'match' | 'search', matchedTitle?, matchedArtist? }
 */
async function resolveTarget(serviceId, item, region) {
  const service = SERVICES[serviceId];
  const fallback = {
    serviceId,
    url: service.searchUrl(item.type, searchQuery(item), { region }),
    kind: 'search'
  };
  if (!service.resolver) return fallback;

  const key = [
    serviceId, item.type, region,
    globalThis.OMI.normalizeArtist(item.artist || ''),
    globalThis.OMI.normalizeTitle(item.title || '')
  ].join('|');

  const cached = await cacheGet(key);
  if (cached !== undefined) return cached || fallback;

  let best = null;
  try {
    const candidates = await resolvers[service.resolver].search(item, region);
    best = pickBest(candidates, item, item.type);
  } catch (e) {
    best = null;
  }

  const result = best
    ? {
        serviceId,
        url: best.candidate.url,
        kind: 'match',
        matchedTitle: best.candidate.title,
        matchedArtist: best.candidate.artist
      }
    : null;

  await cacheSet(key, result);
  return result || fallback;
}

async function handleResolve(msg) {
  const { item, targets, region } = msg;
  const results = await Promise.all(
    targets.map((id) =>
      resolveTarget(id, item, region).catch(() => ({
        serviceId: id,
        url: SERVICES[id].searchUrl(item.type, searchQuery(item), { region }),
        kind: 'search'
      }))
    )
  );
  return { results };
}

/*
 * Ask the source service's own API for canonical metadata. Only Apple Music
 * and Deezer can answer; everywhere else the content script's DOM reading is
 * all we have.
 */
async function handleEnrich(msg) {
  const { serviceId, type, id, region } = msg;
  const service = SERVICES[serviceId];
  if (!service || !service.resolver) return { meta: null };
  const key = ['enrich', serviceId, type, id, region].join('|');
  const cached = await cacheGet(key);
  if (cached !== undefined) return { meta: cached };
  let meta = null;
  try {
    meta = service.resolver === 'itunes'
      ? await resolvers.itunes.lookup(id, region)
      : await resolvers.deezer.lookup(type, id);
  } catch (e) {
    meta = null;
  }
  await cacheSet(key, meta);
  return { meta };
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (!msg || !msg.cmd) return false;

  if (msg.cmd === 'openOptions') {
    chrome.runtime.openOptionsPage();
    sendResponse({ ok: true });
    return false;
  }

  if (msg.cmd !== 'resolve' && msg.cmd !== 'enrich') return false;

  // Async work in a message listener: reply from inside an async IIFE and
  // return true synchronously to hold the channel open.
  (async () => {
    if (msg.cmd === 'resolve') {
      try {
        sendResponse(await handleResolve(msg));
      } catch (e) {
        sendResponse({ results: [] });
      }
      return;
    }
    try {
      sendResponse(await handleEnrich(msg));
    } catch (e) {
      sendResponse({ meta: null });
    }
  })();
  return true;
});

/* Clicking the toolbar icon re-shows a banner the user dismissed. */
chrome.action.onClicked.addListener(async (tab) => {
  if (!tab || !tab.id) return;
  try {
    await chrome.tabs.sendMessage(tab.id, { cmd: 'forceShow' });
  } catch (e) {
    // No content script on this tab (or it is not a supported page) —
    // fall back to opening the settings so the click still does something.
    chrome.runtime.openOptionsPage();
  }
});

/* First install: send the user straight to the settings, since the extension
 * does nothing useful until they tick which services they subscribe to. */
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') chrome.runtime.openOptionsPage();
});
