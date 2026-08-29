(function () {
  'use strict';

  const { SERVICES, SERVICE_ORDER, getSettings, setSettings } = globalThis.OMI;

  const REGIONS = ['SE', 'NO', 'DK', 'FI', 'GB', 'US', 'DE', 'FR', 'NL', 'ES', 'IT', 'PL', 'CA', 'AU', 'JP', 'BR'];

  function msg(key) {
    return chrome.i18n.getMessage(key) || '';
  }

  function applyI18n() {
    for (const el of document.querySelectorAll('[data-i18n]')) {
      const text = msg(el.dataset.i18n);
      if (text) el.textContent = text;
    }
  }

  let savedTimer = null;
  function flashSaved() {
    const el = document.getElementById('saved');
    el.hidden = false;
    clearTimeout(savedTimer);
    savedTimer = setTimeout(() => { el.hidden = true; }, 1400);
  }

  function buildServices(settings, onChange) {
    const wrap = document.getElementById('services');
    wrap.textContent = '';
    for (const id of SERVICE_ORDER) {
      const service = SERVICES[id];

      const label = document.createElement('label');
      label.className = 'service';

      const input = document.createElement('input');
      input.type = 'checkbox';
      input.checked = settings.subscriptions.includes(id);
      input.addEventListener('change', onChange);
      input.dataset.serviceId = id;
      label.appendChild(input);

      const dot = document.createElement('span');
      dot.className = 'dot';
      dot.style.background = service.color;
      label.appendChild(dot);

      const name = document.createElement('span');
      name.className = 'name';
      name.textContent = service.name;
      label.appendChild(name);

      // Be honest in the UI about which services can be matched exactly.
      const tag = document.createElement('span');
      tag.className = 'tag';
      tag.dataset.exact = service.resolver ? '1' : '0';
      tag.textContent = service.resolver ? msg('tagExact') : msg('tagSearch');
      tag.title = service.resolver ? msg('tagExactHint') : msg('tagSearchHint');
      label.appendChild(tag);

      wrap.appendChild(label);
    }
  }

  function buildRegions(settings) {
    const sel = document.getElementById('region');
    sel.textContent = '';
    const auto = document.createElement('option');
    auto.value = 'auto';
    auto.textContent = msg('regionAuto');
    sel.appendChild(auto);
    const names = new Intl.DisplayNames([chrome.i18n.getUILanguage()], { type: 'region' });
    for (const code of REGIONS) {
      const opt = document.createElement('option');
      opt.value = code;
      let label = code;
      try { label = names.of(code) || code; } catch (e) { /* keep the code */ }
      opt.textContent = `${label} (${code})`;
      sel.appendChild(opt);
    }
    sel.value = settings.region;
  }

  function readForm() {
    const subscriptions = [];
    for (const input of document.querySelectorAll('#services input[type="checkbox"]')) {
      if (input.checked) subscriptions.push(input.dataset.serviceId);
    }
    return {
      subscriptions,
      enabled: document.getElementById('enabled').checked,
      hideOnSubscribed: document.getElementById('hideOnSubscribed').checked,
      onlySuggestSubscribed: document.getElementById('onlySuggestSubscribed').checked,
      detectTypes: {
        album: document.getElementById('type-album').checked,
        track: document.getElementById('type-track').checked,
        artist: document.getElementById('type-artist').checked
      },
      region: document.getElementById('region').value
    };
  }

  function updateWarning(values) {
    // Both toggles on with nothing ticked means the banner can never appear.
    const dead = values.onlySuggestSubscribed && values.subscriptions.length === 0;
    document.getElementById('noSubsWarning').hidden = !dead;
  }

  async function save() {
    const values = readForm();
    updateWarning(values);
    await setSettings(values);
    flashSaved();
  }

  async function init() {
    applyI18n();
    const settings = await getSettings();

    buildServices(settings, save);
    buildRegions(settings);

    document.getElementById('enabled').checked = settings.enabled;
    document.getElementById('hideOnSubscribed').checked = settings.hideOnSubscribed;
    document.getElementById('onlySuggestSubscribed').checked = settings.onlySuggestSubscribed;
    document.getElementById('type-album').checked = settings.detectTypes.album;
    document.getElementById('type-track').checked = settings.detectTypes.track;
    document.getElementById('type-artist').checked = settings.detectTypes.artist;

    for (const id of ['enabled', 'hideOnSubscribed', 'onlySuggestSubscribed', 'type-album', 'type-track', 'type-artist', 'region']) {
      document.getElementById(id).addEventListener('change', save);
    }

    updateWarning(readForm());
  }

  init();
})();
