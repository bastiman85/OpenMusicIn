/*
 * Catalogue lookups. Runs in the service worker, never in the content script:
 * a fetch from a content script inherits the host page's CORS origin and CSP,
 * and Spotify's connect-src would block itunes.apple.com outright.
 *
 * Only two of the six services expose a keyless, CORS-open API:
 *   Apple Music -> itunes.apple.com  (Access-Control-Allow-Origin: *)
 *   Deezer      -> api.deezer.com
 * Spotify, TIDAL, YouTube Music and Amazon Music all require OAuth or have no
 * public API, so they get a normalised search URL instead.
 */
(function (root) {
  'use strict';

  const ns = (root.OMI = root.OMI || {});
  const TIMEOUT_MS = 6000;

  async function getJson(url) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(url, { signal: ctrl.signal, credentials: 'omit' });
      if (!res.ok) return null;
      // iTunes serves its JSON as text/javascript, so parse the text ourselves.
      const text = await res.text();
      return JSON.parse(text);
    } catch (e) {
      return null;
    } finally {
      clearTimeout(timer);
    }
  }

  function cleanAppleUrl(u) {
    return typeof u === 'string' ? u.replace(/[?&]uo=\d+$/, '') : u;
  }

  /* ---------------------------------------------------------------- iTunes */

  const ITUNES_ENTITY = { album: 'album', track: 'song', artist: 'musicArtist' };

  function itunesRow(row) {
    if (row.wrapperType === 'artist' || row.kind === 'artist') {
      return { title: row.artistName, artist: row.artistName, url: cleanAppleUrl(row.artistLinkUrl) };
    }
    if (row.wrapperType === 'track' || row.kind === 'song') {
      return { title: row.trackName, artist: row.artistName, url: cleanAppleUrl(row.trackViewUrl) };
    }
    return { title: row.collectionName, artist: row.artistName, url: cleanAppleUrl(row.collectionViewUrl) };
  }

  async function itunesSearch(item, region) {
    const entity = ITUNES_ENTITY[item.type];
    if (!entity) return [];
    // Search broadly, score precisely: querying the raw page title finds
    // nothing for "In Rainbows (Deluxe Edition)", because no such release
    // exists in either catalogue. searchQuery() strips the edition suffix;
    // pickBest() then decides whether what came back is actually the record.
    const term = ns.searchQuery(item);
    if (!term) return [];
    const url = 'https://itunes.apple.com/search'
      + `?term=${encodeURIComponent(term)}`
      + `&entity=${entity}&limit=10&media=music&country=${encodeURIComponent(region || 'US')}`;
    const data = await getJson(url);
    if (!data || !Array.isArray(data.results)) return [];
    return data.results.map(itunesRow).filter((r) => r.url && r.title);
  }

  /* Authoritative metadata for an Apple Music page we are standing on. */
  async function itunesLookup(id, region) {
    const url = `https://itunes.apple.com/lookup?id=${encodeURIComponent(id)}&country=${encodeURIComponent(region || 'US')}`;
    const data = await getJson(url);
    const row = data && Array.isArray(data.results) && data.results[0];
    if (!row) return null;
    const r = itunesRow(row);
    return r.title ? { title: r.title, artist: r.artist } : null;
  }

  /* ---------------------------------------------------------------- Deezer */

  const DEEZER_FIELD = { album: 'album', track: 'track', artist: 'artist' };

  function deezerRow(row, type) {
    if (type === 'artist') {
      return { title: row.name, artist: row.name, url: row.link, rank: row.nb_fan || 0 };
    }
    return {
      title: row.title,
      artist: row.artist && row.artist.name,
      url: row.link,
      rank: row.nb_fan || 0
    };
  }

  async function deezerSearchOnce(type, q) {
    const url = `https://api.deezer.com/search/${type}?limit=10&q=${encodeURIComponent(q)}`;
    const data = await getJson(url);
    if (!data || !Array.isArray(data.data)) return [];
    return data.data.map((r) => deezerRow(r, type)).filter((r) => r.url && r.title);
  }

  async function deezerSearch(item) {
    const type = DEEZER_FIELD[item.type];
    if (!type) return [];
    if (type === 'artist') {
      return deezerSearchOnce('artist', item.artist || item.title || '');
    }
    const field = type === 'album' ? 'album' : 'track';
    const title = ns.normalizeTitleForQuery(item.title || '');
    // Neither query shape dominates the other. The fielded syntax is precise
    // but has blind spots — artist:"Björk" album:"Post" returns "Post (Live)"
    // and an unrelated Urban Björn record, but not "Post" itself, which the
    // plain query finds first. So run both and let the scorer decide.
    const [strict, loose] = await Promise.all([
      deezerSearchOnce(type, `artist:"${item.artist || ''}" ${field}:"${title}"`),
      deezerSearchOnce(type, ns.searchQuery(item))
    ]);
    const seen = new Set();
    const merged = [];
    for (const row of strict.concat(loose)) {
      if (seen.has(row.url)) continue;
      seen.add(row.url);
      merged.push(row);
    }
    return merged;
  }

  /* Authoritative metadata for a Deezer page we are standing on. */
  async function deezerLookup(type, id) {
    const path = DEEZER_FIELD[type];
    if (!path) return null;
    const data = await getJson(`https://api.deezer.com/${path}/${encodeURIComponent(id)}`);
    if (!data || data.error) return null;
    if (type === 'artist') return data.name ? { title: data.name, artist: data.name } : null;
    const artist = data.artist && data.artist.name;
    return data.title ? { title: data.title, artist } : null;
  }

  ns.resolvers = {
    itunes: { search: itunesSearch, lookup: itunesLookup },
    deezer: { search: deezerSearch, lookup: deezerLookup }
  };
})(globalThis);
