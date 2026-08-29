/*
 * Settings, stored in chrome.storage.sync so they follow the Chrome profile.
 */
(function (root) {
  'use strict';

  const ns = (root.OMI = root.OMI || {});

  const DEFAULTS = {
    enabled: true,

    // Services the user actually pays for. Empty until they open the options.
    subscriptions: [],

    // Toggle A: on a service you already subscribe to there is nothing to
    // switch away from, so stay out of the way entirely.
    hideOnSubscribed: true,

    // Toggle B: never offer a service the user has no account on.
    onlySuggestSubscribed: true,

    // Which page kinds get a banner.
    detectTypes: { album: true, track: true, artist: true },

    // 'auto' derives the storefront from the page URL, then the browser locale.
    region: 'auto'
  };

  function withDefaults(stored) {
    const out = Object.assign({}, DEFAULTS, stored || {});
    out.detectTypes = Object.assign({}, DEFAULTS.detectTypes, (stored || {}).detectTypes);
    if (!Array.isArray(out.subscriptions)) out.subscriptions = [];
    return out;
  }

  function get() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(DEFAULTS, (stored) => {
        if (chrome.runtime.lastError) return resolve(withDefaults(null));
        resolve(withDefaults(stored));
      });
    });
  }

  function set(patch) {
    return new Promise((resolve) => chrome.storage.sync.set(patch, () => resolve()));
  }

  /*
   * Resolve the storefront/country code used for Apple Music and Amazon links.
   * Apple Music URLs carry it explicitly; otherwise fall back to the browser's
   * UI language, then to US.
   */
  function resolveRegion(settings, sourceItem) {
    if (settings.region && settings.region !== 'auto') return settings.region.toUpperCase();
    if (sourceItem && sourceItem.country) return sourceItem.country.toUpperCase();
    const ui = (chrome.i18n.getUILanguage && chrome.i18n.getUILanguage()) || '';
    const m = ui.match(/[-_]([A-Za-z]{2})$/);
    if (m) return m[1].toUpperCase();
    if (/^sv/i.test(ui)) return 'SE';
    return 'US';
  }

  ns.SETTINGS_DEFAULTS = DEFAULTS;
  ns.getSettings = get;
  ns.setSettings = set;
  ns.resolveRegion = resolveRegion;
})(globalThis);
