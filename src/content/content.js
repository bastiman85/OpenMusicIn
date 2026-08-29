/*
 * Orchestration: watch the URL, work out what album/track/artist is on screen,
 * decide whether a banner is wanted, and fill it with destination links.
 */
(function (root) {
  'use strict';

  const OMI = root.OMI;
  const { serviceForHost, SERVICE_ORDER, SERVICES, EXTRACTORS, Banner, getSettings, resolveRegion, searchQuery } = OMI;

  const source = serviceForHost(location.hostname);
  if (!source) return;

  // Bumped on every navigation so late async work from a previous page is
  // discarded instead of painting a banner for the wrong album.
  let token = 0;
  let lastUrl = '';
  let currentKey = '';

  const EXTRACT_DELAYS = [0, 250, 600, 1200, 2000, 3200, 4500];

  function sendMessage(msg) {
    return new Promise((resolve) => {
      try {
        chrome.runtime.sendMessage(msg, (res) => {
          if (chrome.runtime.lastError) return resolve(null);
          resolve(res);
        });
      } catch (e) {
        resolve(null);
      }
    });
  }

  function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  function itemKey(item) {
    return `${source.id}:${item.type}:${item.id}`;
  }

  async function isDismissed(key) {
    return new Promise((resolve) => {
      try {
        chrome.storage.session.get([`dismissed:${key}`], (res) => {
          if (chrome.runtime.lastError) return resolve(false);
          resolve(Boolean(res && res[`dismissed:${key}`]));
        });
      } catch (e) {
        resolve(false);
      }
    });
  }

  function setDismissed(key, value) {
    try {
      if (value) chrome.storage.session.set({ [`dismissed:${key}`]: true });
      else chrome.storage.session.remove([`dismissed:${key}`]);
    } catch (e) {
      /* session storage unavailable — dismissal just will not persist */
    }
  }

  /* Try the DOM extractor repeatedly; these are all SPAs and the header we
   * need is usually not there on the first tick. */
  async function extractWithRetries(item, myToken) {
    const extractor = EXTRACTORS[source.id];
    if (!extractor) return null;
    for (const delay of EXTRACT_DELAYS) {
      if (delay) await sleep(delay);
      if (myToken !== token) return null;
      let meta = null;
      try {
        meta = extractor(item);
      } catch (e) {
        meta = null;
      }
      // An artist page only needs a name; album/track pages need both, or the
      // search query will be too weak to match anything.
      if (meta && meta.title && (item.type === 'artist' || meta.artist)) return meta;
      if (meta && meta.title && delay >= 3200) return meta; // give up on the artist
    }
    return null;
  }

  async function describe(item, region, myToken) {
    // Apple Music and Deezer can tell us exactly what we are looking at, in a
    // locale-independent form. Prefer that over scraping their markup.
    if (source.resolver) {
      const res = await sendMessage({
        cmd: 'enrich',
        serviceId: source.id,
        type: item.type,
        id: item.id,
        region
      });
      if (myToken !== token) return null;
      if (res && res.meta && res.meta.title) return res.meta;
    }
    return extractWithRetries(item, myToken);
  }

  function pickTargets(settings) {
    let ids = SERVICE_ORDER.filter((id) => id !== source.id);
    if (settings.onlySuggestSubscribed) {
      ids = ids.filter((id) => settings.subscriptions.includes(id));
    }
    return ids;
  }

  async function run({ force } = {}) {
    const myToken = ++token;
    const url = new URL(location.href);

    let item = null;
    try {
      item = source.parse(url);
    } catch (e) {
      item = null;
    }

    if (!item) {
      Banner.remove();
      currentKey = '';
      return;
    }

    const settings = await getSettings();
    if (myToken !== token) return;

    if (!settings.enabled || !settings.detectTypes[item.type]) {
      Banner.remove();
      return;
    }

    // Toggle A — you are already on a service you pay for, so there is nothing
    // to switch away from.
    if (settings.hideOnSubscribed && settings.subscriptions.includes(source.id)) {
      Banner.remove();
      return;
    }

    const targets = pickTargets(settings);
    if (!targets.length) {
      Banner.remove();
      return;
    }

    const key = itemKey(item);
    if (force) setDismissed(key, false);
    else if (await isDismissed(key)) {
      Banner.remove();
      currentKey = key;
      return;
    }
    if (myToken !== token) return;

    const region = resolveRegion(settings, item);
    const meta = await describe(item, region, myToken);
    if (myToken !== token) return;
    if (!meta || !meta.title) {
      // Nothing readable on the page — better no banner than a banner that
      // sends the user to a nonsense search.
      Banner.remove();
      return;
    }

    const full = { type: item.type, id: item.id, title: meta.title, artist: meta.artist || '' };
    currentKey = key;

    // Paint immediately with search links, then upgrade the two services that
    // can be looked up properly once their APIs answer.
    const entries = new Map();
    for (const id of targets) {
      entries.set(id, {
        url: SERVICES[id].searchUrl(full.type, searchQuery(full), { region }),
        kind: 'search',
        pending: Boolean(SERVICES[id].resolver)
      });
    }

    Banner.render(
      { item: full, services: targets.map((id) => SERVICES[id]), entries },
      {
        onDismiss: () => {
          setDismissed(key, true);
          Banner.remove();
        },
        onSettings: () => sendMessage({ cmd: 'openOptions' })
      }
    );

    const resolvable = targets.filter((id) => SERVICES[id].resolver);
    if (!resolvable.length) return;

    const res = await sendMessage({ cmd: 'resolve', item: full, targets: resolvable, region });
    if (myToken !== token || !Banner.isOpen()) return;
    for (const entry of (res && res.results) || []) {
      Banner.updateEntry(SERVICES[entry.serviceId], {
        url: entry.url,
        kind: entry.kind,
        matchedTitle: entry.matchedTitle,
        matchedArtist: entry.matchedArtist,
        pending: false
      });
    }
  }

  function onNavigate(force) {
    const href = location.href;
    if (!force && href === lastUrl) return;
    lastUrl = href;
    run({ force }).catch(() => {});
  }

  /* None of these sites fire a usable navigation event we can hook from an
   * isolated world, so poll. 400ms is imperceptible and costs nothing. */
  setInterval(() => onNavigate(false), 400);
  window.addEventListener('popstate', () => onNavigate(false));
  window.addEventListener('hashchange', () => onNavigate(false));

  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg && msg.cmd === 'forceShow') {
      lastUrl = location.href;
      run({ force: true }).catch(() => {});
      sendResponse({ ok: true });
    }
    return false;
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync') onNavigate(true);
  });

  onNavigate(false);
})(globalThis);
