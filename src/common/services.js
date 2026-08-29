/*
 * Service registry.
 *
 * Every service knows three things:
 *   parse(url)      -> { type, id } for album / track / artist pages, else null
 *   searchUrl(...)  -> a URL that lands the user on a search inside that service
 *   resolver        -> 'itunes' | 'deezer' | null   (null = search-only, no public API)
 *
 * Loaded as a classic script in both the content script world and the service
 * worker (via importScripts), so it hangs everything off globalThis.OMI.
 */
(function (root) {
  'use strict';

  const ns = (root.OMI = root.OMI || {});

  // Amazon Music runs one storefront per country. Map the region code we
  // resolved for the user onto the right domain; anything unlisted gets .com.
  // Verified by DNS + HTTP, not assumed: there is no music.amazon.se or
  // music.amazon.nl. Countries without their own storefront fall back to .com,
  // which serves a working search everywhere.
  const AMAZON_TLD = {
    US: 'com', GB: 'co.uk', UK: 'co.uk', DE: 'de', FR: 'fr', ES: 'es',
    IT: 'it', CA: 'ca', AU: 'com.au', JP: 'co.jp', IN: 'in',
    BR: 'com.br', MX: 'com.mx'
  };

  function enc(s) {
    return encodeURIComponent(s);
  }

  const SERVICES = {
    spotify: {
      id: 'spotify',
      name: 'Spotify',
      color: '#1DB954',
      hosts: ['open.spotify.com'],
      resolver: null,
      parse(u) {
        // /album/ID, /track/ID, /artist/ID — optionally behind /intl-xx/
        const m = u.pathname.match(/^\/(?:intl-[a-z-]+\/)?(album|track|artist)\/([A-Za-z0-9]+)/);
        return m ? { type: m[1], id: m[2] } : null;
      },
      searchUrl(type, query) {
        const tab = { album: 'albums', track: 'tracks', artist: 'artists' }[type] || '';
        return `https://open.spotify.com/search/${enc(query)}${tab ? '/' + tab : ''}`;
      }
    },

    appleMusic: {
      id: 'appleMusic',
      name: 'Apple Music',
      color: '#FA243C',
      hosts: ['music.apple.com'],
      resolver: 'itunes',
      parse(u) {
        // /se/album/slug/1234567  (+ ?i=trackId), /se/song/slug/123, /se/artist/slug/123
        const m = u.pathname.match(/^(?:\/([a-z]{2}))?\/(album|song|artist)\/[^/]+\/(\d+)/);
        if (!m) return null;
        const country = m[1] ? m[1].toUpperCase() : null;
        const trackParam = u.searchParams.get('i');
        if (m[2] === 'album' && trackParam) {
          return { type: 'track', id: trackParam, country };
        }
        return { type: m[2] === 'song' ? 'track' : m[2], id: m[3], country };
      },
      searchUrl(type, query, ctx) {
        const cc = (ctx.region || 'US').toLowerCase();
        return `https://music.apple.com/${cc}/search?term=${enc(query)}`;
      }
    },

    youtubeMusic: {
      id: 'youtubeMusic',
      name: 'YouTube Music',
      color: '#FF0000',
      hosts: ['music.youtube.com'],
      resolver: null,
      parse(u) {
        if (u.pathname === '/playlist') {
          const list = u.searchParams.get('list');
          // OLAK5uy_ playlists are auto-generated album playlists.
          if (list && /^OLAK5uy_/.test(list)) return { type: 'album', id: list };
          return null;
        }
        if (u.pathname === '/watch') {
          const v = u.searchParams.get('v');
          return v ? { type: 'track', id: v } : null;
        }
        let m = u.pathname.match(/^\/browse\/(MPREb_[A-Za-z0-9_-]+)/);
        if (m) return { type: 'album', id: m[1] };
        m = u.pathname.match(/^\/(?:browse|channel)\/(UC[A-Za-z0-9_-]+)/);
        if (m) return { type: 'artist', id: m[1] };
        // Handle URLs (/@DollyParton) are what YouTube Music actually links to
        // and what ends up in the address bar; the channel id form is rarer.
        m = u.pathname.match(/^\/(@[^/]+)/);
        if (m) return { type: 'artist', id: decodeURIComponent(m[1]) };
        return null;
      },
      searchUrl(type, query) {
        return `https://music.youtube.com/search?q=${enc(query)}`;
      }
    },

    tidal: {
      id: 'tidal',
      name: 'TIDAL',
      color: '#000000',
      hosts: ['tidal.com', 'listen.tidal.com'],
      resolver: null,
      parse(u) {
        const m = u.pathname.match(/^(?:\/browse)?\/(album|track|artist)\/(\d+)/);
        return m ? { type: m[1], id: m[2] } : null;
      },
      searchUrl(type, query) {
        return `https://tidal.com/search?q=${enc(query)}`;
      }
    },

    deezer: {
      id: 'deezer',
      name: 'Deezer',
      color: '#A238FF',
      hosts: ['www.deezer.com'],
      resolver: 'deezer',
      parse(u) {
        const m = u.pathname.match(/^(?:\/[a-z]{2})?\/(album|track|artist)\/(\d+)/);
        return m ? { type: m[1], id: m[2] } : null;
      },
      searchUrl(type, query) {
        return `https://www.deezer.com/search/${enc(query)}/${type}`;
      }
    },

    amazonMusic: {
      id: 'amazonMusic',
      name: 'Amazon Music',
      color: '#25D1DA',
      hosts: [
        'music.amazon.com', 'music.amazon.co.uk', 'music.amazon.de',
        'music.amazon.fr', 'music.amazon.es', 'music.amazon.it',
        'music.amazon.ca', 'music.amazon.com.au', 'music.amazon.co.jp',
        'music.amazon.in', 'music.amazon.com.br', 'music.amazon.com.mx'
      ],
      resolver: null,
      parse(u) {
        const m = u.pathname.match(/^\/(albums|tracks|artists)\/([A-Za-z0-9]+)/);
        if (!m) return null;
        const type = { albums: 'album', tracks: 'track', artists: 'artist' }[m[1]];
        return { type, id: m[2] };
      },
      searchUrl(type, query, ctx) {
        const tld = AMAZON_TLD[(ctx.region || 'US').toUpperCase()] || 'com';
        return `https://music.amazon.${tld}/search/${enc(query)}`;
      }
    }
  };

  const ORDER = ['spotify', 'appleMusic', 'youtubeMusic', 'tidal', 'deezer', 'amazonMusic'];

  function serviceForHost(hostname) {
    for (const id of ORDER) {
      if (SERVICES[id].hosts.includes(hostname)) return SERVICES[id];
    }
    return null;
  }

  ns.SERVICES = SERVICES;
  ns.SERVICE_ORDER = ORDER;
  ns.serviceForHost = serviceForHost;
})(globalThis);
