# Chrome Web Store Listing — OpenMusicIn

> Last Updated: 2026-08-29
> Version: 0.9.0 — first submission, Unlisted.
> Status: not yet submitted. One blocker remains: the three screenshots.
> Everything else on this page is done, privacy policy included and live.

## Store Listing

**Extension Name** [REQUIRED]
OpenMusicIn

**Short Description** [REQUIRED] *(104 chars)*
Jump from an album, track or artist to the same release on the music services you actually subscribe to.

**Detailed Description** [REQUIRED]

OpenMusicIn puts a bar at the top of album, track and artist pages so you can open the same release on the music services you actually subscribe to.

Found an album on a service you do not pay for? One click takes you to it on the one you do.

FEATURES
• Works on Spotify, Apple Music, YouTube Music, TIDAL, Deezer and Amazon Music — as both the page you start from and the place you end up.
• Recognises albums, tracks and artists. Turn any of the three off if you only want one.
• Every button says what it will do: "exact" opens the matching release directly, "search" opens a search already filled in with the artist and title.
• Tell it which services you subscribe to and it stays out of your way — no bar on a service you already pay for, and it never offers one you have no account on.
• The bar pushes the page down instead of covering it, so the site's own menus and player stay usable.
• Dismiss it for any release you are not interested in.
• Careful matching. Edition suffixes such as "(Deluxe Edition)" or "- 2011 Remaster" are ignored when looking a release up, but a live or demo recording is never passed off as the studio album. When the match is not convincing, you get a search rather than a wrong link.
• Your settings follow you to your other computers.
• Available in English and Swedish.

HOW TO USE
1. Install the extension. The settings open by themselves the first time.
2. Tick the music services you subscribe to. Nothing appears until you do.
3. Open any album, track or artist page on one of the six services.
4. Click the service you want in the bar at the top. It opens in a new tab.
5. Click the extension icon in the toolbar to bring a dismissed bar back.

WHY SOME BUTTONS SAY "SEARCH"
Apple Music and Deezer let anyone look a release up, so those buttons go straight to it. Spotify, TIDAL, YouTube Music and Amazon Music offer no such way in, so those buttons open a search with the artist and title already typed for you. The label on each button tells you which you are getting, every time.

PRIVACY
No accounts, no analytics, no tracking, and no server of our own. Nothing about you is collected.

To find a matching release, the artist name and title shown on the page are sent to Apple's and Deezer's public catalogue searches. That is all that is sent, and it is sent nowhere else. No record is kept of the pages you visit.

Your settings are held by Chrome and carried between your own computers by Chrome's own sync, under your Google account. We never receive them.

Full policy: https://bastiman85.github.io/OpenMusicIn/privacy.html

PERMISSIONS
• "Read your data on the six music services" — the extension has to read the artist and album name from the page you are on in order to find that release elsewhere. It reads nothing else, and it runs on no other website.
• "Read your data on itunes.apple.com and api.deezer.com" — these are the two catalogue searches used to find a matching release.
• "Storage" — remembers which services you subscribe to, your display choices, and which bars you have dismissed.

SUPPORT
Bugs and suggestions: https://github.com/bastiman85/OpenMusicIn/issues
Email: openmusicin@bastiman.nu

Version 0.9.0 — First release.

**Category** [REQUIRED]
Entertainment

Google's own definition: "These extensions are designed for fans of sports,
music, television, and cinema." Music is named outright, and that is who this is
for. Note that the pre-2023 category list — the one where "Productivity" lived —
no longer exists; the closest current alternative, Functionality & UI, is for tab
and shortcut managers and would put this in front of the wrong audience.

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

**Privacy Policy URL** [REQUIRED] — ✅ live at <https://bastiman85.github.io/OpenMusicIn/privacy.html>

`PRIVACY.md` is the source; `docs/privacy.html` is the page to publish, built
from it with `python3 tools/build-privacy-page.py`. It is generated rather than
hand-written so the hosted policy cannot drift from the repository copy — and
so it cannot drift from the data-use table above, which is a documented
rejection reason.

Hosted with GitHub Pages from the `docs/` folder on `main` of https://github.com/bastiman85/OpenMusicIn.
Note that Pages is not available for private repositories on GitHub's free
plan — this repository is public for that reason.

Rebuild and republish after any change to `PRIVACY.md`:

    python3 tools/build-privacy-page.py && git commit -am "Update privacy policy" && git push

Pages redeploys on push. Open the URL yourself after any change — reviewers do.

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

**Support URL / Email** [RECOMMENDED] — https://github.com/bastiman85/OpenMusicIn/issues

**Homepage URL** [RECOMMENDED] — https://github.com/bastiman85/OpenMusicIn


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
