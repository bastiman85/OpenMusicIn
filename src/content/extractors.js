/*
 * Reading artist + title off the page we are standing on.
 *
 * All six sites are single-page apps, so nothing here can assume the DOM is
 * ready on first call — content.js retries each extractor on a schedule until
 * one returns something or it gives up.
 *
 * Each extractor is a list of strategies tried in order, most reliable first.
 */
(function (root) {
  'use strict';

  const ns = (root.OMI = root.OMI || {});

  function meta(prop) {
    const el =
      document.querySelector(`meta[property="${prop}"]`) ||
      document.querySelector(`meta[name="${prop}"]`);
    const v = el && el.getAttribute('content');
    return v ? v.trim() : '';
  }

  function text(selector) {
    const el = document.querySelector(selector);
    if (!el) return '';
    return (el.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function jsonLdNodes() {
    const out = [];
    for (const s of document.querySelectorAll('script[type="application/ld+json"]')) {
      let parsed;
      try {
        parsed = JSON.parse(s.textContent);
      } catch (e) {
        continue;
      }
      for (const node of Array.isArray(parsed) ? parsed : [parsed]) {
        if (node && typeof node === 'object') out.push(node);
      }
    }
    return out;
  }

  function artistName(byArtist) {
    if (!byArtist) return '';
    const first = Array.isArray(byArtist) ? byArtist[0] : byArtist;
    if (!first) return '';
    return (typeof first === 'string' ? first : first.name || '') .trim();
  }

  /* Same page, ignoring query noise YouTube appends (?cbrd=1&ucbcb=1). */
  function sameEntity(a, b) {
    try {
      const ua = new URL(a, location.href);
      const ub = new URL(b, location.href);
      return ua.hostname === ub.hostname && ua.pathname === ub.pathname;
    } catch (e) {
      return false;
    }
  }

  function ok(title, artist) {
    title = (title || '').trim();
    artist = (artist || '').trim();
    return title ? { title, artist } : null;
  }

  /* ------------------------------------------------------------- Spotify */

  function spotify(item) {
    // og:description is "Radiohead · Album · 2007 · 10 songs" in every locale.
    const ogTitle = meta('og:title');
    const ogDesc = meta('og:description');
    if (item.type === 'artist' && ogTitle) return ok(ogTitle, ogTitle);
    if (ogTitle && ogDesc && ogDesc.includes('·')) {
      const artist = ogDesc.split('·')[0].trim();
      if (artist) return ok(ogTitle, artist);
    }

    // Rendered DOM.
    const domTitle = text('span[data-testid="entityTitle"] h1') || text('main h1');
    const domArtist = text('a[data-testid="creator-link"]');
    if (item.type === 'artist' && domTitle) return ok(domTitle, domTitle);
    if (domTitle && domArtist) return ok(domTitle, domArtist);

    // document.title: "In Rainbows - Album by Radiohead | Spotify"
    const t = document.title.replace(/\s*[|—-]\s*Spotify\s*$/i, '').trim();
    if (!t) return null;
    if (item.type === 'artist') return ok(t, t);
    const m = t.match(/^(.*?)\s+-\s+.*?\bby\s+(.+)$/i);
    if (m) return ok(m[1], m[2]);
    return ogTitle ? ok(ogTitle, '') : null;
  }

  /* --------------------------------------------------------- Apple Music */

  function appleMusic(item) {
    // JSON-LD is locale-independent; og:title is not ("... av Radiohead på ...").
    for (const node of jsonLdNodes()) {
      const t = node['@type'];
      if (item.type === 'album' && t === 'MusicAlbum') {
        return ok(node.name, artistName(node.byArtist));
      }
      if (item.type === 'track' && (t === 'MusicRecording' || t === 'MusicComposition')) {
        return ok(node.name, artistName(node.byArtist));
      }
      if (item.type === 'artist' && (t === 'MusicGroup' || t === 'Person')) {
        return ok(node.name, node.name);
      }
    }
    // Album page with ?i=<trackId>: the JSON-LD describes the album, so the
    // track name has to come from the DOM (or from the itunes lookup that
    // content.js runs in parallel).
    const domTitle = text('h1[data-testid="non-editable-product-title"]') || text('main h1');
    const domArtist = text('a[data-testid="click-action"]') || text('.headings__subtitles a');
    if (item.type === 'artist' && domTitle) return ok(domTitle, domTitle);
    if (domTitle) return ok(domTitle, domArtist);
    return null;
  }

  /* -------------------------------------------------------- YouTube Music */

  function youtubeMusic(item) {
    if (item.type === 'track') {
      const t = text('.ytmusic-player-bar .title') || text('ytmusic-player-bar .title');
      const a = text('.ytmusic-player-bar .byline a') || text('ytmusic-player-bar .byline a');
      if (t) return ok(t, a);
      return null;
    }
    if (item.type === 'artist') {
      // Artist pages ship real og tags, unlike album and watch pages. They are
      // only trusted when og:url still points at the page we are on: this is a
      // SPA, and the head is not guaranteed to be rewritten on in-app
      // navigation, which would otherwise name the previous artist.
      const ogUrl = meta('og:url');
      const ogTitle = meta('og:title');
      if (ogTitle && ogUrl && sameEntity(ogUrl, location.href)) return ok(ogTitle, ogTitle);
      const t =
        text('ytmusic-immersive-header-renderer h1') ||
        text('ytmusic-visual-header-renderer h1') ||
        text('ytmusic-responsive-header-renderer .title');
      return t ? ok(t, t) : null;
    }
    // Album: the header renderer changed shape at least twice, so try both.
    const t =
      text('ytmusic-responsive-header-renderer .title') ||
      text('ytmusic-detail-header-renderer .title') ||
      text('ytmusic-detail-header-renderer h2.title');
    const a =
      text('ytmusic-responsive-header-renderer .strapline-text') ||
      text('ytmusic-detail-header-renderer .subtitle a') ||
      text('ytmusic-responsive-header-renderer yt-formatted-string.byline a');
    return t ? ok(t, a) : null;
  }

  /* --------------------------------------------------------------- TIDAL */

  function tidal(item) {
    // og:title is "U2 - Achtung Baby" on tidal.com.
    const ogTitle = meta('og:title');
    if (item.type === 'artist') {
      if (ogTitle) {
        const name = ogTitle.replace(/\s+on\s+TIDAL\s*$/i, '').trim();
        return ok(name, name);
      }
    } else if (ogTitle) {
      const m = ogTitle.match(/^(.+?)\s+-\s+(.+)$/);
      if (m) return ok(m[2], m[1]);
      return ok(ogTitle, '');
    }

    // listen.tidal.com renders client-side and ships no og tags.
    const domTitle = text('[data-test="artist-page-title"]') || text('main h1') || text('h1');
    const domArtist = text('[data-test="artist-link"]') || text('[data-test="artist-name"]');
    if (item.type === 'artist' && domTitle) return ok(domTitle, domTitle);
    if (domTitle) return ok(domTitle, domArtist);

    const t = document.title.replace(/\s*(?:\||on)\s*TIDAL\s*$/i, '').trim();
    if (!t) return null;
    if (item.type === 'artist') return ok(t, t);
    const m = t.match(/^(.+?)\s+-\s+(.+)$/);
    return m ? ok(m[2], m[1]) : ok(t, '');
  }

  /* -------------------------------------------------------------- Deezer */

  function deezer(item) {
    // og:description is "Eminem - album - 2005 - 17 songs".
    const ogTitle = meta('og:title');
    const ogDesc = meta('og:description');
    if (item.type === 'artist' && ogTitle) return ok(ogTitle, ogTitle);
    if (ogTitle && ogDesc) {
      const artist = ogDesc.split(' - ')[0].trim();
      if (artist) return ok(ogTitle, artist);
    }
    const domTitle = text('main h1') || text('h1');
    const domArtist = text('[data-testid="item_subtitle"] a') || text('main h1 + * a');
    if (item.type === 'artist' && domTitle) return ok(domTitle, domTitle);
    if (domTitle) return ok(domTitle, domArtist);
    return ogTitle ? ok(ogTitle, '') : null;
  }

  /* -------------------------------------------------------- Amazon Music */

  function amazonMusic(item) {
    const header = document.querySelector('music-detail-header');
    if (header) {
      const t = header.getAttribute('headline') || header.getAttribute('primary-text');
      const a = header.getAttribute('secondary-text');
      if (item.type === 'artist' && t) return ok(t, t);
      if (t) return ok(t, a);
    }
    const ogTitle = meta('og:title');
    if (ogTitle) {
      const m = ogTitle.match(/^(.+?)\s+by\s+(.+?)\s+on\s+Amazon Music/i);
      if (m) return ok(m[1], m[2]);
    }
    // "In Rainbows by Radiohead on Amazon Music - Amazon.com"
    const m2 = document.title.match(/^(.+?)\s+by\s+(.+?)\s+on\s+Amazon Music/i);
    if (m2) return ok(m2[1], m2[2]);
    const domTitle = text('music-detail-header .headline') || text('main h1') || text('h1');
    if (item.type === 'artist' && domTitle) return ok(domTitle, domTitle);
    return domTitle ? ok(domTitle, '') : null;
  }

  ns.EXTRACTORS = { spotify, appleMusic, youtubeMusic, tidal, deezer, amazonMusic };
})(globalThis);
