# Chrome Web Store Listing — OpenMusicIn

> Last Updated: 2026-08-29
> Version: 0.9.0 — first submission, Unlisted.
> Status: **submitted for review 2026-08-29.** Awaiting the outcome.
> Expect a longer wait than usual: the dashboard warned that the twenty host
> match patterns trigger an in-depth review.

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
Links an album, track or artist page on one music streaming service to the same
release on other music streaming services.

The longer version required by the dashboard's Privacy practices tab is under
"Privacy Practices Tab — exact field texts" below.

**Primary Language** [REQUIRED]
English (Swedish also supplied via `_locales`)

## Graphics & Assets

All generated assets live in `store-assets/` and are rebuilt with
`python3 tools/make-store-assets.py`.

| Asset | Dimensions | Status | Filename |
|-------|-----------|--------|----------|
| Store Icon [REQUIRED] | 128×128 PNG | ✅ Ready | `store-assets/store-icon-128x128.png` |
| Screenshot 1 [REQUIRED] | 1280×800 | ✅ Uploaded | `store-assets/screenshot-1-settings.png` |
| Screenshot 2 | 1280×800 | ✅ Uploaded | `store-assets/screenshot-2-Spotify.png` |
| Screenshot 3 | 1280×800 | ✅ Uploaded | `store-assets/screenshot-3-AppleMusic.png` |
| Screenshot 4 | 1280×800 | ✅ Uploaded | `store-assets/screenshot-4-YTMusic.png` |
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

Keep the submitted files in `store-assets/`, named after what they show, so each
release ships with the screenshots that document it. Verify sizes with:

    python3 tools/check-store-assets.py

**For the next version, lead with the bar rather than the settings.** The store
shows the first screenshot first and largest, and the guidance is to show the
extension in action. `screenshot-2-Spotify.png` is the stronger opener: it shows
the whole product in one frame, with both "exact" and "search" buttons visible.
Reordering means re-submitting the listing, so it is not worth doing mid-review.

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

## Privacy Practices Tab — exact field texts

The Developer Dashboard blocks publishing until these are filled in. Paste each
one verbatim; they are written to match what the code actually does, because a
disagreement between these answers and the extension's behaviour is a rejection.

### Single purpose description

OpenMusicIn has one function: when you are looking at an album, track or artist page on a supported music streaming service, it shows a bar linking to the same release on the other services you subscribe to.

That is all it does. It does not inject advertising, does not modify the page's own content, does not change your search settings, and does not add unrelated features. The bar appears only on release pages of the six supported services, is dismissible, and can be switched off entirely per content type in the settings. On a service you have told it you subscribe to, it stays hidden, because there is nothing to switch away from.

### Permissions justification — storage *(415/1000 chars)*

Stores the user's own settings: which streaming services they subscribe to, whether the bar should appear for albums, tracks and artists, the storefront country, and which bars they have dismissed. Settings use storage.sync so they follow the user's Chrome profile. Dismissals and cached catalogue lookups use storage.session and are discarded when the browser closes. No browsing history or page content is stored.

### Permissions justification — host permissions *(976/1000 chars)*

The dashboard exposes **one** field here, not one per host. It covers all 20
match patterns — the 2 in `host_permissions` and the 18 in `content_scripts`
together — so the text has to account for every one of them. Explaining only
the two catalogue APIs leaves the 18 that actually trigger the "may need
in-depth review" warning unaddressed.

The extension's single function is to link a music release to the same release on another service. That needs exactly two things from the page: the artist name and the release title.

Music service hosts (open.spotify.com, music.apple.com, music.youtube.com, tidal.com, listen.tidal.com, www.deezer.com and the music.amazon storefronts) are the six services supported. On album, track and artist pages it reads only the artist and title and adds one dismissible bar of links. It changes nothing else, injects no advertising, and runs on no other website. Access must be automatic rather than click-triggered, because the bar has to be there when the page loads.

Catalogue hosts (itunes.apple.com, api.deezer.com) are Apple's and Deezer's public catalogue searches. The artist and title are sent there to find the matching release, so those two buttons link straight to it instead of to a search. No other host is contacted, and no identifier or browsing history is ever sent.

### Test instructions (Testanvisningar)

**Username / Password: leave both empty.** The extension has no accounts, and
album pages on the supported services are viewable signed out — verified with
both the Spotify and Deezer test URLs returning 200 without a session. Never put
a real personal login in this form.

The additional-instructions field matters more here than for most extensions:
the bar shows nothing until services are ticked, so a reviewer who installs it
and opens Spotify sees an extension that appears to do nothing.

**Additional instructions** *(500/500 chars)*

No account or sign-in is needed, for the extension or for the streaming services. Album pages are publicly viewable.

1. Install. The settings page opens by itself.
2. Tick Apple Music and Deezer under "Services I subscribe to". Nothing appears until at least one is ticked.
3. Open https://open.spotify.com/album/5vkqYmiPBYLaalcmjujWxK
4. A bar appears at the top with Apple Music and Deezer buttons.

By design no bar appears on a ticked service, so do not test on Apple Music or Deezer themselves.

### Remote code

Select **"No, I am not using remote code."**

All JavaScript is contained in the uploaded package. Nothing is fetched and executed at runtime. The only network requests are catalogue searches to itunes.apple.com and api.deezer.com, whose JSON responses are read as data — never evaluated as code.

### Data use certification

Tick all three:
- Data is not being sold to third parties, outside of approved use cases
- Data is not being used or transferred for purposes unrelated to the item's single purpose
- Data is not being used or transferred to determine creditworthiness or for lending purposes

Disclose under **Website content**: the artist name and release title are read
from the page and sent to the two catalogue APIs to find a matching release.

Disclose under **User activity** *(settings only)*: the user's chosen services
and display preferences are carried between their own devices by Chrome Sync,
under their own Google account. The developer never receives them.

Everything else: not collected.

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
| 0.9.0 | 2026-08-29 | Submitted for review. Lookup cache moved to session storage so it survives service-worker restarts; message handling converted to async/await; short description brought under the 132-character limit; banner pins its own colour scheme; Chrome Sync declared as off-device transmission; store assets, privacy policy page and this listing document added. | **Submitted 2026-08-29** — in review |
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
- **Verified live on three of six services.** Taking the screenshots exercised
  the extension on real Spotify, Apple Music and YouTube Music pages. TIDAL,
  Deezer and Amazon Music have not been confirmed as *source* pages, though all
  six work as destinations in the automated tests.

  Three things the Spotify screenshot confirms that had only been tested
  indirectly: edition normalisation works in production — an album titled
  "x (Deluxe Edition)" resolved to "exact" on both Apple Music and Deezer, which
  is precisely the case that returned no results before the search term was
  normalised; the bar pushes the page down without covering Spotify's own header;
  and it all works while signed out, which is what the reviewer test instructions
  assume.

### What to expect from this review

The in-depth review warning was raised by the twenty host match patterns, not by
anything specific that is wrong. Reviews of this kind commonly take longer than
the usual few days.

If it comes back rejected, the three most likely grounds given what this
extension does, and the answer to each:

1. **Host permission breadth.** Twelve of the twenty patterns are Amazon Music
   storefronts. Dropping Amazon Music removes 60% of the host surface and costs
   one search-only button for a service with no Swedish storefront. That is the
   single largest concession available without changing what the extension does.
2. **Single purpose, because of the persistent bar.** The justification already
   states that the bar is dismissible, appears only on release pages of six
   named services, and can be switched off per content type. Point at that.
3. **Data use mismatch.** The disclosure declares website content (artist and
   title to the two catalogue APIs) and user activity (settings via Chrome Sync).
   Both are what the code does. If a reviewer disputes it, the privacy policy at
   the URL on file says the same thing in the same terms.

### Rejection History

None so far.
