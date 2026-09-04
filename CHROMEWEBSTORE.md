# Chrome Web Store Listing — OpenMusicIn

> Last Updated: 2026-08-29
> Version: 0.9.1 — submitted, Unlisted, listed in English and Swedish.
> Status: **rejected 2026-08-29 for keyword spam; descriptions rewritten,
> awaiting resubmission.** Listing metadata only — the package is unchanged.
> 0.9.0 was cancelled before review completed, to avoid shipping the Apple
> Music layout bug.
> Expect a longer wait than usual: the dashboard warned that the twenty host
> match patterns trigger an in-depth review.

## Store Listing

**Extension Name** [REQUIRED]
OpenMusicIn

**Short Description** [REQUIRED] *(104 chars)*
Jump from an album, track or artist to the same release on the music services you actually subscribe to.

**Detailed Description** [REQUIRED]

OpenMusicIn adds a bar at the top of album, track and artist pages on music streaming sites, linking to the same release on the other services you use.

Tick the services you subscribe to and the bar offers only those, staying hidden on one you already pay for. Every link is labelled: a direct link where the release can be looked up, otherwise a ready-made search.

The bar pushes the page down instead of covering it, and can be dismissed. Nothing about you is collected.

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

## Swedish listing (sv locale)

✅ Live in the dashboard alongside the English listing, from 0.9.1.

The dashboard offers a language dropdown at the top of Store listing, with one
entry per `_locales/` directory the extension ships — so Swedish sits alongside
English rather than replacing it. Screenshots can be localised too; the English
captures currently serve both. Taking Swedish ones means switching Arc back to
Swedish first.

The button labels below are the ones the Swedish interface actually renders
("exakt", "sök"), not translations of the English labels. A description that
names labels the user cannot find is worse than no description.

**Kort beskrivning** *(102/132 tecken)*

Hoppa från ett album, en låt eller en artist till samma utgåva på de musiktjänster du prenumererar på.

**Detaljerad beskrivning**

OpenMusicIn lägger en rad högst upp på album-, låt- och artistsidor hos musiktjänster på webben, med länk till samma utgåva hos de andra tjänster du använder.

Kryssa i vilka tjänster du prenumererar på så erbjuder raden bara dessa, och håller sig dold på en du redan betalar för. Varje länk är märkt: en direktlänk där utgåvan går att slå upp, annars en färdig sökning.

Raden skjuter ner sidan i stället för att täcka den, och går att stänga. Ingenting om dig samlas in.

## Graphics & Assets

All generated assets live in `store-assets/` and are rebuilt with
`python3 tools/make-store-assets.py`.

| Asset | Dimensions | Status | Filename |
|-------|-----------|--------|----------|
| Store Icon [REQUIRED] | 128×128 PNG | ✅ Ready | `store-assets/store-icon-128x128.png` |
| Screenshot 1 [REQUIRED] | 1280×800 | ✅ Uploaded | `store-assets/screenshot-1-Spotify.png` |
| Screenshot 2 | 1280×800 | ✅ Uploaded | `store-assets/screenshot-2-AppleMusic.png` |
| Screenshot 3 | 1280×800 | ✅ Uploaded | `store-assets/screenshot-3-YTMusic.png` |
| Screenshot 4 | 1280×800 | ✅ Uploaded | `store-assets/screenshot-4-settings.png` |

Filenames mirror the order they were uploaded in, which is the order the store
displays them.
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

The listing leads with the bar on a real Spotify album page — the whole product
in one frame, with both "exact" and "search" buttons visible — and keeps the
settings page last. That is the right order: the store shows the first
screenshot largest, and the guidance is to show the extension in action rather
than its configuration.

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
| 0.9.1 | 2026-08-29 | Fixes the bar hiding Apple Music's own bottom banner. Shrinking the root element does not reach a layout sized with viewport units, so viewport-height elements are now measured and shrunk too. Replaces the cancelled 0.9.0. | **Submitted 2026-08-29** — in review |
| 0.9.0 | 2026-08-29 | Submitted, then review cancelled before it completed. Lookup cache moved to session storage so it survives service-worker restarts; message handling converted to async/await; short description brought under the 132-character limit; banner pins its own colour scheme; Chrome Sync declared as off-device transmission; store assets, privacy policy page and this listing document added. | Cancelled — superseded by 0.9.1 |
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

**2026-08-29 (second) — v0.9.1 — Keyword Spam again** (Yellow Argon)

Same violation, same quoted content — the six-service list — even though each
service was by then named only once. The reviewer objects to naming the services
in the description at all, not to how often.

Fix: no brand names anywhere in the description, and cut to three short
paragraphs that fit above the fold. Privacy policy and support links moved out of
the description body — the dashboard has dedicated fields for both, so repeating
them was length without benefit. From ~2,900 characters to ~450.

The permission justifications on the Privacy practices tab still name the hosts
and services. That is a different field, it is reviewer-facing, and Google
explicitly asks for that specificity there. Do not strip those.

**2026-08-29 (first) — v0.9.1 — Keyword Spam** (violation reference: Yellow Argon)

> "Har överdrivet många sökord i objektets beskrivning."
> Quoted: *Spotify, Apple Music, YouTube Music, TIDAL, Deezer and Amazon Music*

Cause: the full six-service list appeared **twice** in the description — once in
the feature list and once, split up, in a section explaining why some buttons
open a search. Thirteen brand mentions in a 3,200-character description read as
keyword stuffing regardless of intent.

Fix: each service is named **exactly once**, in a single canonical list under
FEATURES. Everywhere else refers to them generically ("a supported service",
"two catalogue search services"). The section that re-listed them was removed and
its one useful fact folded into the button-label bullet. Brand mentions went from
13 to 6 in each language, and the hostnames `itunes.apple.com` and
`api.deezer.com` were dropped from the description — they carry brand names, add
nothing for users, and the reviewer reads the real justifications on the Privacy
practices tab anyway.

Only the listing changed. The package is untouched, so no version bump is
needed — this is a metadata resubmission.

Lesson for future edits: naming the supported services is legitimately
descriptive, but only once. Every later reference should be generic.
