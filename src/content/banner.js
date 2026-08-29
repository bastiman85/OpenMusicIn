/*
 * The banner itself.
 *
 * Rendered inside a shadow root attached to <html>, so neither the host page's
 * stylesheets nor its framework re-rendering the <body> can touch it.
 * Everything is built with createElement/textContent — album titles are
 * untrusted strings and never go near innerHTML.
 */
(function (root) {
  'use strict';

  const ns = (root.OMI = root.OMI || {});
  const HOST_ID = 'openmusicin-host';

  const CSS = `
:host { all: initial; }
* { box-sizing: border-box; }
.bar {
  /* The bar is a deliberately dark surface injected into pages of every theme,
     so pin the colour scheme rather than inheriting the host page's. "only"
     stops browsers auto-adapting it back. Set here and not on :host because
     this is the element that actually carries a background — setting it on a
     transparent ancestor risks mixing colour pairs from two schemes. */
  color-scheme: only dark;
  position: fixed;
  left: 0; right: 0;
  /* The page is pushed down by translating <html>, which also becomes the
     containing block for this fixed bar — --omi-top cancels that back out so
     the bar still sits against the top of the viewport. */
  top: var(--omi-top, 0px);
  z-index: 2147483647;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 9px 12px;
  font: 500 13px/1.35 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  color: #f4f4f5;
  background: rgba(18, 18, 20, 0.94);
  -webkit-backdrop-filter: saturate(1.6) blur(14px);
  backdrop-filter: saturate(1.6) blur(14px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 6px 22px rgba(0, 0, 0, 0.32);
  animation: omi-in 180ms ease-out;
}
@keyframes omi-in { from { transform: translateY(-100%); } to { transform: translateY(0); } }
@media (prefers-reduced-motion: reduce) { .bar { animation: none; } }

.mark {
  flex: 0 0 auto;
  width: 22px; height: 22px;
  display: grid; place-items: center;
  border-radius: 6px;
  background: linear-gradient(135deg, #6d5cff, #b14cff);
  font-size: 12px;
}
.what {
  flex: 0 1 auto;
  min-width: 0;
  display: flex; align-items: baseline; gap: 7px;
  white-space: nowrap;
}
.title { font-weight: 650; overflow: hidden; text-overflow: ellipsis; max-width: 38vw; }
.artist { color: rgba(244, 244, 245, 0.62); overflow: hidden; text-overflow: ellipsis; max-width: 24vw; }
.label { flex: 0 0 auto; color: rgba(244, 244, 245, 0.62); }

.links {
  flex: 1 1 auto;
  display: flex; flex-wrap: wrap; align-items: center; gap: 6px;
  min-width: 0;
}
.chip {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 5px 10px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: rgba(255, 255, 255, 0.06);
  color: inherit;
  text-decoration: none;
  white-space: nowrap;
  transition: background 120ms ease, border-color 120ms ease;
}
.chip:hover { background: rgba(255, 255, 255, 0.14); border-color: rgba(255, 255, 255, 0.3); }
.chip:focus-visible { outline: 2px solid #8b7bff; outline-offset: 2px; }
.chip[data-pending="1"] { opacity: 0.55; }
/* Outer ring, not inset: TIDAL's brand colour is black, which is otherwise
   invisible against the dark bar. */
.dot { width: 8px; height: 8px; border-radius: 50%; flex: 0 0 auto; box-shadow: 0 0 0 1.5px rgba(255,255,255,0.55); }
.kind {
  font-size: 10px; letter-spacing: 0.04em; text-transform: uppercase;
  color: rgba(244, 244, 245, 0.5);
}
.chip[data-kind="match"] .kind { color: #6ee7a8; }

.spacer { flex: 0 0 auto; margin-left: auto; display: flex; gap: 6px; }
.icon-btn {
  appearance: none; cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: rgba(255, 255, 255, 0.06);
  color: rgba(244, 244, 245, 0.9);
  width: 30px; height: 30px; border-radius: 8px; font-size: 16px; line-height: 1;
  display: grid; place-items: center;
}
/* The gear glyph renders noticeably lighter than the ✕ at the same size. */
.icon-btn.gear { font-size: 18px; }
.icon-btn:hover { background: rgba(255, 255, 255, 0.18); border-color: rgba(255, 255, 255, 0.34); color: #fff; }
.icon-btn:focus-visible { outline: 2px solid #8b7bff; outline-offset: 1px; }

@media (max-width: 720px) {
  .label, .artist { display: none; }
  .title { max-width: 45vw; }
}
`;

  let hostEl = null;
  let shadow = null;
  let linksEl = null;
  let barEl = null;
  let pushStyle = null;
  let resizeObs = null;
  let vhMarked = [];
  let chipById = new Map();
  let handlers = {};

  /*
   * Push the page down instead of covering it.
   *
   * Padding or margin on <html> or <body> is not enough: every one of these
   * apps pins its own navigation with position:fixed, which is laid out
   * against the viewport and would stay put underneath the banner. Giving the
   * root element a transform makes it the containing block for those fixed
   * descendants, so the whole page — chrome included — moves down together.
   */
  /*
   * Shrinking <html> does not reach a descendant sized with 100vh — viewport
   * units ignore the ancestor entirely. Apple Music lays its shell out as a
   * viewport-height grid whose last row is the upsell banner, so the push moved
   * that row straight off the bottom of the screen while html itself shrank
   * correctly. Spotify and YouTube Music never showed this because their chrome
   * is position:fixed, which the transform does handle.
   *
   * There is no selector for "sized with 100vh", so measure instead: anything
   * exactly as tall as the viewport gets marked, and the push stylesheet takes
   * the banner's height off it. Must run before the transform is applied, while
   * the measurements still mean something.
   */
  function markViewportHeightElements() {
    vhMarked = [];
    const vh = window.innerHeight;
    if (!vh || !document.body) return;
    (function walk(el, depth) {
      if (depth > 5) return;
      for (const child of el.children) {
        const rect = child.getBoundingClientRect();
        // Width guard keeps narrow full-height rails, like sidebars, out of it.
        if (Math.abs(rect.height - vh) < 1.5 && rect.width > 200) {
          child.setAttribute('data-omi-vh', '');
          vhMarked.push(child);
        }
        walk(child, depth + 1);
      }
    })(document.body, 0);
  }

  function applyPush() {
    if (!barEl || !hostEl) return;
    const h = Math.ceil(barEl.getBoundingClientRect().height);
    if (!h) return;
    if (!pushStyle) {
      markViewportHeightElements();
      pushStyle = document.createElement('style');
      pushStyle.id = 'openmusicin-push';
      (document.head || document.documentElement).appendChild(pushStyle);
    }
    // height, not just min-height: these app shells set html{height:100%}, which
    // keeps the root box a full viewport tall. Translated down, its bottom edge
    // then sits h px below the fold — and since the transform also makes the
    // root the containing block for the page's own fixed elements, a player bar
    // pinned to bottom:0 goes with it, off screen. Shrinking the box by exactly
    // h puts that edge back at the bottom of the viewport.
    const css =
      ':root{transform:translateY(' + h + 'px)!important;' +
      'height:calc(100% - ' + h + 'px)!important;' +
      'min-height:calc(100% - ' + h + 'px)!important;}' +
      '[data-omi-vh]{height:calc(100vh - ' + h + 'px)!important;' +
      'max-height:calc(100vh - ' + h + 'px)!important;}';
    if (pushStyle.textContent !== css) pushStyle.textContent = css;
    // Custom properties cross the shadow boundary, and `all: initial` on :host
    // does not reset them.
    hostEl.style.setProperty('--omi-top', '-' + h + 'px');
  }

  function clearPush() {
    if (resizeObs) {
      resizeObs.disconnect();
      resizeObs = null;
    }
    for (const el of vhMarked) el.removeAttribute('data-omi-vh');
    vhMarked = [];
    if (pushStyle && pushStyle.parentNode) pushStyle.parentNode.removeChild(pushStyle);
    pushStyle = null;
  }

  function t(key, subs) {
    try {
      return chrome.i18n.getMessage(key, subs) || key;
    } catch (e) {
      return key;
    }
  }

  function remove() {
    clearPush();
    if (hostEl && hostEl.parentNode) hostEl.parentNode.removeChild(hostEl);
    hostEl = null;
    shadow = null;
    linksEl = null;
    barEl = null;
    chipById = new Map();
  }

  function isOpen() {
    return Boolean(hostEl && hostEl.isConnected);
  }

  function makeChip(service, entry) {
    const a = document.createElement('a');
    a.className = 'chip';
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.href = entry.url;
    a.dataset.kind = entry.kind;
    a.dataset.pending = entry.pending ? '1' : '0';

    const dot = document.createElement('span');
    dot.className = 'dot';
    dot.style.background = service.color;
    a.appendChild(dot);

    const name = document.createElement('span');
    name.textContent = service.name;
    a.appendChild(name);

    const kind = document.createElement('span');
    kind.className = 'kind';
    // While a lookup is in flight the link already works — it just points at a
    // search for now. Saying "no public API" here would be a lie about exactly
    // the two services that have one.
    if (entry.pending) {
      kind.textContent = t('kindPending');
      a.title = t('tooltipPending');
    } else if (entry.kind === 'match') {
      kind.textContent = t('kindMatch');
      a.title = t('tooltipMatch', [entry.matchedTitle || '', entry.matchedArtist || '']);
    } else {
      kind.textContent = t('kindSearch');
      a.title = t('tooltipSearch');
    }
    a.appendChild(kind);

    return a;
  }

  /*
   * state: { item: {type, title, artist}, services: [serviceDef],
   *          entries: Map(serviceId -> {url, kind, pending}) }
   */
  function render(state, cbs) {
    handlers = cbs || {};
    remove();

    hostEl = document.createElement('div');
    hostEl.id = HOST_ID;
    // Attached to <html>: SPA routers replace <body> subtrees freely.
    document.documentElement.appendChild(hostEl);
    shadow = hostEl.attachShadow({ mode: 'open' });

    const style = document.createElement('style');
    style.textContent = CSS;
    shadow.appendChild(style);

    const bar = document.createElement('div');
    bar.className = 'bar';
    bar.setAttribute('role', 'region');
    bar.setAttribute('aria-label', t('extName'));

    const mark = document.createElement('span');
    mark.className = 'mark';
    mark.textContent = '♪';
    bar.appendChild(mark);

    const what = document.createElement('div');
    what.className = 'what';
    const title = document.createElement('span');
    title.className = 'title';
    title.textContent = state.item.title || '';
    what.appendChild(title);
    if (state.item.artist && state.item.type !== 'artist') {
      const artist = document.createElement('span');
      artist.className = 'artist';
      artist.textContent = state.item.artist;
      what.appendChild(artist);
    }
    bar.appendChild(what);

    const label = document.createElement('span');
    label.className = 'label';
    label.textContent = t('bannerOpenIn');
    bar.appendChild(label);

    linksEl = document.createElement('div');
    linksEl.className = 'links';
    for (const service of state.services) {
      const entry = state.entries.get(service.id);
      if (!entry) continue;
      const chip = makeChip(service, entry);
      chipById.set(service.id, chip);
      linksEl.appendChild(chip);
    }
    bar.appendChild(linksEl);

    const spacer = document.createElement('div');
    spacer.className = 'spacer';

    const gear = document.createElement('button');
    gear.className = 'icon-btn gear';
    gear.type = 'button';
    gear.textContent = '⚙';
    gear.title = t('openSettings');
    gear.setAttribute('aria-label', t('openSettings'));
    gear.addEventListener('click', () => handlers.onSettings && handlers.onSettings());
    spacer.appendChild(gear);

    const close = document.createElement('button');
    close.className = 'icon-btn';
    close.type = 'button';
    close.textContent = '✕';
    close.title = t('dismiss');
    close.setAttribute('aria-label', t('dismiss'));
    close.addEventListener('click', () => handlers.onDismiss && handlers.onDismiss());
    spacer.appendChild(close);

    bar.appendChild(spacer);
    shadow.appendChild(bar);

    barEl = bar;
    applyPush();
    if (typeof ResizeObserver === 'function') {
      resizeObs = new ResizeObserver(applyPush);
      resizeObs.observe(bar);
    }
  }

  /* Upgrade a chip in place once the catalogue lookup comes back. */
  function updateEntry(service, entry) {
    const chip = chipById.get(service.id);
    if (!chip) return;
    const fresh = makeChip(service, entry);
    chip.replaceWith(fresh);
    chipById.set(service.id, fresh);
  }

  ns.Banner = { render, remove, isOpen, updateEntry };
})(globalThis);
