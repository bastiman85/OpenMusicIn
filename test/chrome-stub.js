/*
 * Minimal chrome.* stub so the real banner and options code can be previewed
 * in a plain browser tab. Dev-only; never shipped.
 * Locale is chosen with ?locale=sv (default en).
 */
(function () {
  const params = new URLSearchParams(location.search);
  const locale = params.get('locale') || 'en';
  const store = {};
  let messages = {};

  window.chrome = {
    i18n: {
      getMessage(key, subs) {
        const entry = messages[key];
        if (!entry) return '';
        let out = entry.message;
        (subs || []).forEach((v, i) => { out = out.split('$' + (i + 1)).join(v); });
        return out;
      },
      getUILanguage: () => (locale === 'sv' ? 'sv-SE' : 'en-US')
    },
    runtime: { lastError: null, sendMessage(_m, cb) { cb && cb({}); }, openOptionsPage() {} },
    storage: {
      sync: {
        get(defaults, cb) { cb(Object.assign({}, defaults, store)); },
        set(patch, cb) { Object.assign(store, patch); cb && cb(); }
      },
      onChanged: { addListener() {} }
    }
  };

  window.__stubReady = fetch(`../_locales/${locale}/messages.json`)
    .then((r) => r.json())
    .then((m) => { messages = m; });
})();
