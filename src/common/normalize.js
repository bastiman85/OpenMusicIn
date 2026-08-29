/*
 * Title/artist normalisation and fuzzy matching.
 *
 * Streaming services disagree constantly about edition suffixes:
 *   "In Rainbows"  vs  "In Rainbows (Disk 2)"  vs  "In Rainbows [Deluxe Edition]"
 * Deezer's own API returns the Disk 2 pressing above the real album for an
 * exact query, so we cannot trust result order — everything gets scored.
 */
(function (root) {
  'use strict';

  const ns = (root.OMI = root.OMI || {});

  // Words that mark a parenthetical as an edition/version tag rather than part
  // of the actual title. "(Love Song)" is kept; "(Deluxe Edition)" is dropped.
  const EDITION_WORDS = [
    'deluxe', 'expanded', 'remaster', 'remastered', 'remastering', 'anniversary',
    'edition', 'version', 'bonus', 'explicit', 'clean', 'mono', 'stereo',
    'reissue', 'special', 'super', 'collector', 'collectors', 'limited',
    'complete', 'extended', 'edit', 'disc', 'disk', 'cd', 'vol', 'volume',
    'digipak', 'japanese', 'international', 'standard', 'original soundtrack'
  ];
  const EDITION_RE = new RegExp('\\b(?:' + EDITION_WORDS.join('|') + ')\\b', 'i');

  function stripDiacritics(s) {
    return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  function dropBrackets(s) {
    // Remove (...) and [...] groups that look like edition tags.
    return s
      .replace(/\(([^()]*)\)/g, (all, inner) => (EDITION_RE.test(inner) ? ' ' : all))
      .replace(/\[([^[\]]*)\]/g, (all, inner) => (EDITION_RE.test(inner) ? ' ' : all));
  }

  function dropTrailingEdition(s) {
    // "Album - 2011 Remaster", "Song - Radio Edit"
    return s.replace(/\s+[-–—]\s+[^-–—]*$/, (tail) => (EDITION_RE.test(tail) ? '' : tail));
  }

  function dropFeatures(s) {
    return s.replace(/\s*[([]?\s*\b(?:feat|ft|featuring|med)\b\.?\s+[^)\]]*[)\]]?/gi, ' ');
  }

  function collapse(s) {
    return stripDiacritics(s)
      .toLowerCase()
      .replace(/&/g, ' and ')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
  }

  function normalizeTitle(s) {
    if (!s) return '';
    return collapse(dropFeatures(dropTrailingEdition(dropBrackets(s))));
  }

  function normalizeArtist(s) {
    if (!s) return '';
    let out = collapse(dropFeatures(s));
    out = out.replace(/^the /, '');
    return out;
  }

  function bigrams(s) {
    const out = new Map();
    for (let i = 0; i < s.length - 1; i++) {
      const g = s.slice(i, i + 2);
      out.set(g, (out.get(g) || 0) + 1);
    }
    return out;
  }

  // Sørensen–Dice on character bigrams. Cheap, no dependencies, and forgiving
  // of the punctuation and word-order noise these catalogues are full of.
  function similarity(a, b) {
    if (!a || !b) return 0;
    if (a === b) return 1;
    if (a.length < 2 || b.length < 2) return a === b ? 1 : 0;
    const A = bigrams(a);
    const B = bigrams(b);
    let shared = 0;
    let total = 0;
    for (const n of A.values()) total += n;
    for (const n of B.values()) total += n;
    for (const [g, n] of A) {
      const m = B.get(g);
      if (m) shared += Math.min(n, m);
    }
    return (2 * shared) / total;
  }

  /*
   * Score one candidate from a service API against what we read off the page.
   * Returns 0..1; callers compare against MATCH_THRESHOLD.
   */
  function scoreCandidate(candidate, target, type) {
    if (type === 'artist') {
      return similarity(normalizeArtist(candidate.artist), normalizeArtist(target.artist));
    }
    const titleSim = similarity(normalizeTitle(candidate.title), normalizeTitle(target.title));
    const artistSim = similarity(normalizeArtist(candidate.artist), normalizeArtist(target.artist));
    // A wrong artist is disqualifying no matter how well the title lines up —
    // "Greatest Hits" would otherwise match every artist in the catalogue.
    if (artistSim < 0.6) return 0;
    // And a strong artist match must not drag a weak title over the line:
    // "Homogenic" vs "Homogenic (Live)" scored 0.85 on the blend alone, which
    // would have sent the user to the wrong record. "(Live)", "(Demo)" and
    // friends are deliberately NOT stripped as edition noise — they really are
    // different releases — so the title has to stand on its own here.
    if (titleSim < TITLE_GATE) return 0;
    return titleSim * 0.62 + artistSim * 0.38;
  }

  const TITLE_GATE = 0.85;
  const MATCH_THRESHOLD = 0.82;

  /*
   * Edition stripping makes "In Rainbows", "In Rainbows (Disk 2)" and
   * "In Rainbows (Deluxe Edition)" all score identically, and Deezer really
   * does return the Disk 2 pressing first. Ties therefore go to the least
   * embellished raw title — the main release rather than a bonus disc or a
   * repackaging.
   */
  function embellishment(candidate, type) {
    const raw = type === 'artist' ? candidate.artist : candidate.title;
    return collapse(raw || '').length;
  }

  function pickBest(candidates, target, type) {
    let best = null;
    let bestScore = 0;
    let bestLen = Infinity;
    let bestRank = -1;
    for (const c of candidates) {
      const s = scoreCandidate(c, target, type);
      if (s === 0 || s < bestScore) continue;
      const len = embellishment(c, type);
      // rank is a service-supplied popularity hint (Deezer's follower count).
      // Deezer's artist search returns a 499-follower duplicate "Radiohead"
      // ahead of the real one; nothing textual can tell them apart.
      const rank = typeof c.rank === 'number' ? c.rank : 0;
      const better =
        s > bestScore ||
        len < bestLen ||
        (len === bestLen && rank > bestRank);
      if (better) {
        bestScore = s;
        bestLen = len;
        bestRank = rank;
        best = c;
      }
    }
    return bestScore >= MATCH_THRESHOLD ? { candidate: best, score: bestScore } : null;
  }

  /*
   * Edition suffixes removed but the title otherwise left readable — used both
   * for the search-URL fallback and as the term sent to the catalogue APIs.
   */
  function normalizeTitleForQuery(title) {
    return dropTrailingEdition(dropBrackets(title || '')).replace(/\s+/g, ' ').trim();
  }

  function searchQuery(item) {
    if (item.type === 'artist') return item.artist || item.title || '';
    const artist = item.artist || '';
    return [artist, normalizeTitleForQuery(item.title)].filter(Boolean).join(' ').trim();
  }

  ns.looseNormalize = collapse;
  ns.normalizeTitle = normalizeTitle;
  ns.normalizeArtist = normalizeArtist;
  ns.similarity = similarity;
  ns.scoreCandidate = scoreCandidate;
  ns.pickBest = pickBest;
  ns.normalizeTitleForQuery = normalizeTitleForQuery;
  ns.searchQuery = searchQuery;
  ns.MATCH_THRESHOLD = MATCH_THRESHOLD;
  ns.TITLE_GATE = TITLE_GATE;
})(globalThis);
