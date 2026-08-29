# Chrome Web Store Listing — OpenMusicIn

> Last Updated: 2026-08-29
> Version: 0.9.0 — first submission, Unlisted.
> Status: not yet submitted. One blocker remains: the three screenshots.
> Everything else on this page is done.

## Store Listing

**Extension Name** [REQUIRED]
OpenMusicIn

**Short Description** [REQUIRED] *(113 chars)*
Open an album, track or artist on one streaming service and jump straight to it on the services you subscribe to.

**Detailed Description** [REQUIRED]

Found an album on the wrong streaming service? OpenMusicIn puts a bar at the top of the page with a button for each service you actually subscribe to.

It works on album, track and artist pages across Spotify, Apple Music, YouTube Music, TIDAL, Deezer and Amazon Music. For Apple Music and Deezer the button takes you straight to the matching release. For the other four it opens a search already filled in with the artist and title, because those services do not offer a public way to look a release up.

Every button is labelled so you know which one you are getting: "exact" for a direct link, "search" for a search.

Tell it which services you subscribe to and it stays out of your way: no bar on a service you already pay for, and it never suggests a service you have no account on. You can also choose whether it appears for albums, tracks, artists, or only some of those. The bar pushes the page down rather than covering it, so the site's own navigation and player stay usable, and you can dismiss it for any release you are not interested in.

Matching is careful on purpose. Edition suffixes like "(Deluxe Edition)" or "- 2011 Remaster" are ignored when searching, but a live or demo recording is never presented as the studio release. When the match is not good enough, you get a search instead of a wrong link.

The artist and title read from the page are sent only to Apple's and Deezer's public catalogue services, and only to look up a match. Nothing else leaves your browser, and no browsing history is stored.

Settings sync across the Chrome profiles you are signed in to. Interface available in English and Swedish.

**Category** [REQUIRED]
Productivity

**Single Purpose** [REQUIRED]
Links an album, track or artist page on one music streaming service to the same release on other music streaming services.

**Primary Language** [REQUIRED]
English (Swedish also supplied via `_locales`)

## Graphics & Assets

All generated assets live in `store-assets/` and are rebuilt with
`python3 tools/make-store-assets.py`.

| Asset | Dimensions | Status | Filename |
|-------|-----------|--------|----------|
| Store Icon [REQUIRED] | 128×128 PNG | ✅ Ready | `store-assets/store-icon-128x128.png` |
| Screenshot 1 [REQUIRED] | 1280×800 | ⬜ Must be captured by hand | — |
| Screenshot 2 [RECOMMENDED] | 1280×800 | ⬜ Must be captured by hand | — |
| Screenshot 3 [RECOMMENDED] | 1280×800 | ⬜ Must be captured by hand | — |
| Small Promo Tile [RECOMMENDED] | 440×280 | ✅ Ready | `store-assets/promo-small-440x280.png` |
| Marquee Promo Tile | 1400×560 | ✅ Ready | `store-assets/promo-marquee-1400x560.png` |

### Screenshot Notes

Screenshots cannot be generated from the source — the store rules forbid
misleading imagery, and a shot of the bar over a mock page would be exactly
that. Each one has to be captured in Chrome with the extension actually
installed and the streaming services actually signed in.

Capture at exactly 1280×800. In Chrome: DevTools → device toolbar → Responsive →
type 1280 × 800 → capture screenshot from the ⋮ menu.

1. **The bar on a real album page** (required). Pick an album that resolves to
   "exact" on Apple Music and Deezer and "search" elsewhere, so both button
   states are visible. This single image is the whole product.
2. **The settings page.** Note that it is 1216px tall and its content column is
   680px wide, so a raw 1280×800 capture is both sparse and cut off. Scroll so
   that "Services I subscribe to" and "Behaviour" fill the frame, with several
   services ticked.
3. **The bar on an artist page**, to show it is not only albums.

Retake all of them whenever the bar's layout changes.

## Permissions Justification

| Permission | Type | Justification |
|------------|------|---------------|
| `storage` | permissions | Stores which streaming services the user subscribes to, the display preferences, and which banners they have dismissed. Settings use `storage.sync` so they follow the user's Chrome profile — Chrome replicates that through the user's own Google account. Dismissals and cached lookups use `storage.session` and are discarded when the browser closes. No browsing history is recorded. |
| `https://itunes.apple.com/*` | host_permissions | Apple's public catalogue search. The artist and album title read from the current page are sent here to find the matching Apple Music release, so the Apple Music button can link directly to it instead of to a search. |
| `https://api.deezer.com/*` | host_permissions | Deezer's public catalogue search, used for the same purpose as above, so the Deezer button can link directly to the matching release. |
| `open.spotify.com`, `music.apple.com`, `music.youtube.com`, `tidal.com`, `listen.tidal.com`, `www.deezer.com`, `music.amazon.*` (12 storefronts) | content_scripts matches | The extension has to read the artist and album name from the page the user is looking at in order to find that release elsewhere. Access is limited to these six streaming services; the extension runs on no other site. |

Note for the reviewer: there is no `tabs` permission. The toolbar-icon handler
uses only `tab.id` to message the content script, never `tab.url`.

## Privacy & Data Use

### Data Collection

**Does the extension collect user data?** No data reaches the developer. Two
categories must still be declared: website content (artist and title, sent to
the two catalogue APIs) and user activity (the settings, replicated by Chrome
Sync).

The extension transmits two pieces of page content — the artist name and the
release title — to two public catalogue APIs in order to find the matching
release. Nothing is collected, profiled or retained by the developer.

Separately, the user's settings are held in `chrome.storage.sync`, which Chrome
replicates through the user's own Google account. That is off-device
transmission for disclosure purposes even though the developer never receives
it, so it is declared below rather than described as purely local.

| Data Type | Collected? | Transmitted Off-Device? | Purpose | Shared with Third Parties? |
|-----------|-----------|------------------------|---------|---------------------------|
| Personally identifiable info | No | No | — | No |
| Health info | No | No | — | No |
| Financial info | No | No | — | No |
| Authentication info | No | No | — | No |
| Personal communications | No | No | — | No |
| Location | No | No | — | No |
| Web history | No | No | — | No |
| User activity | Yes — extension settings only | Yes — via the user's own Chrome Sync | Carry the user's chosen services and display preferences between their own Chrome profiles | No. Handled by Chrome Sync under the user's Google account; the developer has no access. |
| Website content | No | Yes — artist name and release title only | Look up the same release on Apple Music and Deezer | No. Sent only to `itunes.apple.com` and `api.deezer.com` as ordinary catalogue searches. |

### Data Use Certification

- [x] Data is NOT sold to third parties
- [x] Data is NOT used for purposes unrelated to the extension's core functionality
- [x] Data is NOT used for creditworthiness or lending purposes

## Privacy Policy

**Privacy Policy URL** [REQUIRED] — ⬜ written and built, not yet hosted.

`PRIVACY.md` is the source; `docs/privacy.html` is the page to publish, built
from it with `python3 tools/build-privacy-page.py`. It is generated rather than
hand-written so the hosted policy cannot drift from the repository copy — and
so it cannot drift from the data-use table above, which is a documented
rejection reason.

To host: push this repository to GitHub, then enable Pages with the source set
to the `docs/` folder on the default branch. The policy is then live at
`https://<user>.github.io/<repo>/privacy.html`. Enter that URL here and in the
dashboard, and open it once yourself to confirm it loads — reviewers do.

## Distribution

**Visibility**: **Unlisted** for the first submission. Installable by link but
absent from search and categories, which is the right posture while the
behaviour on the live services is still unverified. It can be switched to
Public later without another code review.
**Regions**: All regions. Note that Amazon Music has no Swedish storefront, so
Swedish users are sent to the `.com` search.

## Developer Info

**Publisher Name** [REQUIRED] — Sebastian, publishing as an individual rather
than under Axaco. No organisation verification or linked domain is required for
an individual publisher. *(Confirm whether the listing should show the full
name — Google shows exactly what is entered here.)*

**Contact Email** [REQUIRED] — `openmusicin@bastiman.nu`

A dedicated address rather than a personal inbox, since it is displayed publicly
on the listing and is therefore scrapeable. Google also sends takedown and
policy notices here, so it must stay monitored — confirm it actually receives
mail before submitting.

**Support URL / Email** [RECOMMENDED] — GitHub Issues on this repository, once it
is pushed to a remote. That happens anyway to host the privacy policy.

**Homepage URL** [RECOMMENDED] — none.

A one-time USD 5 developer registration fee is payable to Google before the
first submission.

## Packaging

`./tools/package.sh` writes `dist/openmusicin-<version>.zip` containing only
`manifest.json`, `icons/`, `_locales/` and `src/`. Everything else — this file,
`README.md`, `PRIVACY.md`, `docs/`, `store-assets/`, `test/`, `tools/`, `dist/`
— is excluded by construction rather than by ignore rules, so no development or
listing file can leak into a submission.

## Version History

| Version | Date | Changes | Status |
|---------|------|---------|--------|
| 0.9.0 | 2026-08-29 | Prepared for submission. Lookup cache moved to session storage so it survives service-worker restarts; message handling converted to async/await; short description brought under the 132-character limit; banner pins its own colour scheme; Chrome Sync declared as off-device transmission; store assets, privacy policy page and this listing document added. | Draft — ready to submit once the screenshots exist |
| 0.1.0 | 2026-08-29 | First build, never submitted. Six services, album/track/artist detection, direct links for Apple Music and Deezer, search fallback elsewhere, subscription-aware settings, English and Swedish. | Superseded |

## Review Notes

### Known Issues / Limitations

- **YouTube Music and Amazon Music metadata is read from the page's markup.**
  Neither service offers a public API or stable structured data for this, so
  several fallback selectors are tried over a few seconds. A large redesign on
  their side can break detection. The other four services are read from `og:`
  tags, JSON-LD or the service's own API and are considerably more robust.
- **Four of six services can only be linked by search.** Spotify, TIDAL,
  YouTube Music and Amazon Music have no public catalogue API that works without
  authentication. Buttons for those are labelled "search" so the behaviour is
  never misrepresented.
- **The bar pushes the page down using a transform on the root element.** On a
  site where the document itself scrolls, that makes `position: fixed` behave
  like `absolute`. All six target services are app shells where inner containers
  scroll, so it does not surface there — but it is the reason the technique is
  scoped to these six sites.
- **Not yet verified on the live services.** The matching logic has 45 automated
  tests against the real catalogue APIs, and the bar has been verified against a
  page that reproduces the app-shell layout, but the extension has not been
  exercised end to end while signed in to all six services. This should be done
  before submission — screenshots require it anyway.

### Rejection History

None — not yet submitted.
