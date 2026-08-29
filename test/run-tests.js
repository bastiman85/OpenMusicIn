/*
 * Dev-only harness. Not shipped in the extension.
 *
 *   node test/run-tests.js          URL parsing + search URLs (offline)
 *   node test/run-tests.js --live   also hits itunes.apple.com and api.deezer.com
 *
 * Loads the same source files the extension does, so nothing here is a
 * reimplementation of the logic under test.
 */
require('../src/common/services.js');
require('../src/common/normalize.js');
require('../src/background/resolvers.js');

const { SERVICES, serviceForHost, pickBest, searchQuery, resolvers } = globalThis.OMI;

let pass = 0;
let fail = 0;

function check(name, actual, expected) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a === e) {
    pass++;
    console.log(`  ok   ${name}`);
  } else {
    fail++;
    console.log(`  FAIL ${name}\n         expected ${e}\n         actual   ${a}`);
  }
}

function parseUrl(href) {
  const u = new URL(href);
  const service = serviceForHost(u.hostname);
  if (!service) return { service: null };
  const item = service.parse(u);
  return { service: service.id, item };
}

console.log('\n== URL parsing ==');

const URL_CASES = [
  ['https://open.spotify.com/album/5vkqYmiPBYLaalcmjujWxK', 'spotify', { type: 'album', id: '5vkqYmiPBYLaalcmjujWxK' }],
  ['https://open.spotify.com/intl-sv/album/5vkqYmiPBYLaalcmjujWxK', 'spotify', { type: 'album', id: '5vkqYmiPBYLaalcmjujWxK' }],
  ['https://open.spotify.com/track/3CRDbSIZ4r5MsZ0YwxuEkn?si=abc', 'spotify', { type: 'track', id: '3CRDbSIZ4r5MsZ0YwxuEkn' }],
  ['https://open.spotify.com/artist/4Z8W4fKeB5YxbusRsdQVPb', 'spotify', { type: 'artist', id: '4Z8W4fKeB5YxbusRsdQVPb' }],
  ['https://open.spotify.com/search/foo', 'spotify', null],

  ['https://music.apple.com/se/album/in-rainbows/1109714933', 'appleMusic', { type: 'album', id: '1109714933', country: 'SE' }],
  ['https://music.apple.com/se/album/in-rainbows/1109714933?i=1109714945', 'appleMusic', { type: 'track', id: '1109714945', country: 'SE' }],
  ['https://music.apple.com/us/artist/radiohead/657515', 'appleMusic', { type: 'artist', id: '657515', country: 'US' }],
  ['https://music.apple.com/browse', 'appleMusic', null],

  ['https://music.youtube.com/playlist?list=OLAK5uy_kABC123', 'youtubeMusic', { type: 'album', id: 'OLAK5uy_kABC123' }],
  ['https://music.youtube.com/playlist?list=PLsomethingelse', 'youtubeMusic', null],
  ['https://music.youtube.com/watch?v=dQw4w9WgXcQ', 'youtubeMusic', { type: 'track', id: 'dQw4w9WgXcQ' }],
  ['https://music.youtube.com/channel/UCabcdef123', 'youtubeMusic', { type: 'artist', id: 'UCabcdef123' }],
  ['https://music.youtube.com/browse/MPREb_abc123', 'youtubeMusic', { type: 'album', id: 'MPREb_abc123' }],
  ['https://music.youtube.com/@DollyParton', 'youtubeMusic', { type: 'artist', id: '@DollyParton' }],
  ['https://music.youtube.com/@DollyParton?cbrd=1&ucbcb=1', 'youtubeMusic', { type: 'artist', id: '@DollyParton' }],
  ['https://music.youtube.com/@Bj%C3%B6rk', 'youtubeMusic', { type: 'artist', id: '@Björk' }],
  ['https://music.youtube.com/', 'youtubeMusic', null],
  ['https://music.youtube.com/explore', 'youtubeMusic', null],

  ['https://tidal.com/browse/album/77640617', 'tidal', { type: 'album', id: '77640617' }],
  ['https://tidal.com/album/77640617', 'tidal', { type: 'album', id: '77640617' }],
  ['https://listen.tidal.com/album/77640617', 'tidal', { type: 'album', id: '77640617' }],
  ['https://tidal.com/browse/artist/13908', 'tidal', { type: 'artist', id: '13908' }],

  ['https://www.deezer.com/en/album/119606', 'deezer', { type: 'album', id: '119606' }],
  ['https://www.deezer.com/album/119606', 'deezer', { type: 'album', id: '119606' }],
  ['https://www.deezer.com/sv/track/138546807', 'deezer', { type: 'track', id: '138546807' }],

  ['https://music.amazon.co.uk/albums/B0BXYZ1234', 'amazonMusic', { type: 'album', id: 'B0BXYZ1234' }],
  ['https://music.amazon.com.au/albums/B0BXYZ1234', 'amazonMusic', { type: 'album', id: 'B0BXYZ1234' }],
  ['https://music.amazon.se/albums/B0BXYZ1234', null, undefined],
  ['https://music.amazon.com/artists/B000ABCDEF', 'amazonMusic', { type: 'artist', id: 'B000ABCDEF' }],
  ['https://music.amazon.de/tracks/B0TRACK001', 'amazonMusic', { type: 'track', id: 'B0TRACK001' }],

  ['https://example.com/album/1', null, undefined]
];

for (const [href, expectedService, expectedItem] of URL_CASES) {
  const got = parseUrl(href);
  const label = href.replace(/^https:\/\//, '');
  if (expectedService === null) check(label, got.service, null);
  else check(label, { service: got.service, item: got.item }, { service: expectedService, item: expectedItem });
}

console.log('\n== search URLs ==');

const item = { type: 'album', title: 'In Rainbows [Deluxe Edition]', artist: 'Radiohead' };
const q = searchQuery(item);
check('normalised query', q, 'Radiohead In Rainbows');
// music.amazon.se does not exist; Sweden must fall back to the .com storefront.
for (const [region, expectedHost] of [['SE', 'music.amazon.com'], ['NL', 'music.amazon.com'],
                                      ['GB', 'music.amazon.co.uk'], ['DE', 'music.amazon.de'],
                                      ['AU', 'music.amazon.com.au'], ['JP', 'music.amazon.co.jp']]) {
  const u = new URL(SERVICES.amazonMusic.searchUrl('album', q, { region }));
  check(`amazon storefront ${region}`, u.hostname, expectedHost);
}

for (const id of ['spotify', 'appleMusic', 'youtubeMusic', 'tidal', 'deezer', 'amazonMusic']) {
  const url = SERVICES[id].searchUrl('album', q, { region: 'SE' });
  console.log(`  ${id.padEnd(13)} ${url}`);
  if (!/^https:\/\//.test(url) || url.includes(' ')) {
    fail++;
    console.log('  FAIL malformed search URL');
  } else pass++;
}

/* ------------------------------------------------------------------ live */

/*
 * expect is either a string (same outcome from both catalogues) or a per-service
 * map, because the two catalogues genuinely differ by storefront.
 */
const LIVE_CASES = [
  { type: 'album',  artist: 'Radiohead', title: 'In Rainbows',                  expect: 'match' },
  { type: 'album',  artist: 'Radiohead', title: 'In Rainbows (Deluxe Edition)', expect: 'match' },
  { type: 'album',  artist: 'Eminem',    title: 'Curtain Call: The Hits',       expect: 'match' },
  { type: 'album',  artist: 'Björk',     title: 'Post',                         expect: 'match' },
  // Apple Music SE carries only "Homogenic (Live)"; Deezer has the studio album.
  // The title gate must refuse to call the live record an exact match.
  { type: 'album',  artist: 'Björk',     title: 'Homogenic',
    expect: { appleMusic: 'search', deezer: 'match' } },
  { type: 'album',  artist: 'Håkan Hellström', title: 'Känn ingen sorg för mig Göteborg', expect: 'match' },
  { type: 'track',  artist: 'Radiohead', title: 'Nude',                         expect: 'match' },
  { type: 'artist', artist: 'Radiohead', title: 'Radiohead',                    expect: 'match' },
  { type: 'album',  artist: 'Nonexistent Band Qqzz', title: 'Album That Is Not Real Qqzz', expect: 'search' }
];

function expectedFor(target, serviceId) {
  return typeof target.expect === 'string' ? target.expect : target.expect[serviceId];
}

async function live() {
  console.log('\n== live catalogue lookups ==');
  for (const target of LIVE_CASES) {
    for (const [serviceId, resolverName] of [['appleMusic', 'itunes'], ['deezer', 'deezer']]) {
      let kind = 'search';
      let url = SERVICES[serviceId].searchUrl(target.type, searchQuery(target), { region: 'SE' });
      let matched = '';
      try {
        const candidates = await resolvers[resolverName].search(target, 'SE');
        const best = pickBest(candidates, target, target.type);
        if (best) {
          kind = 'match';
          url = best.candidate.url;
          matched = `${best.candidate.artist} — ${best.candidate.title} (${best.score.toFixed(2)})`;
        }
      } catch (e) {
        console.log(`  FAIL ${serviceId} threw: ${e.message}`);
        fail++;
        continue;
      }
      const label = `${serviceId.padEnd(11)} ${target.type.padEnd(6)} ${target.artist} — ${target.title}`;
      const expected = expectedFor(target, serviceId);
      if (kind === expected) {
        pass++;
        console.log(`  ok   ${label}\n         ${kind}: ${matched || url}`);
        if (kind === 'match') console.log(`         ${url}`);
      } else {
        fail++;
        console.log(`  FAIL ${label}\n         expected ${expected}, got ${kind} ${matched}`);
      }
    }
  }

  console.log('\n== source-page enrichment (lookup by id) ==');
  const apple = await resolvers.itunes.lookup('1109714933', 'SE');
  check('itunes lookup 1109714933', apple, { title: 'In Rainbows', artist: 'Radiohead' });
  const dz = await resolvers.deezer.lookup('album', '119606');
  check('deezer lookup album/119606', dz, { title: 'Curtain Call: The Hits', artist: 'Eminem' });
  const dzArtist = await resolvers.deezer.lookup('artist', '399');
  check('deezer lookup artist/399', dzArtist, { title: 'Radiohead', artist: 'Radiohead' });
}

(async () => {
  if (process.argv.includes('--live')) await live();
  console.log(`\n${pass} passed, ${fail} failed\n`);
  process.exit(fail ? 1 : 0);
})();
