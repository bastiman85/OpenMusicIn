# OpenMusicIn

Chrome-tillägg. Öppnar du ett album, en låt eller en artist på en
streamingtjänst lägger det en banner högst upp på sidan med knappar som tar dig
till samma sak på de tjänster du faktiskt prenumererar på.

Sex tjänster stöds, både som källa och mål: **Spotify, Apple Music,
YouTube Music, TIDAL, Deezer, Amazon Music.**

## Installera (uppackat)

1. Öppna `chrome://extensions`
2. Slå på **Utvecklarläge** uppe till höger
3. **Läs in okompakterat tillägg** → välj den här mappen
4. Inställningarna öppnas automatiskt vid installation. Kryssa i vilka tjänster
   du prenumererar på — utan det visas ingen banner.

## Inställningar

- **Tjänster jag prenumererar på** — styr allt annat.
- **Visa inget på tjänster jag prenumererar på** — ingen banner på en tjänst du
  redan betalar för.
- **Föreslå bara tjänster jag prenumererar på** — erbjud aldrig en tjänst du
  saknar konto på.
- **Visa bannern för** — album, låtar, artister, var för sig.
- **Butik** — landskod för Apple Music och Amazon Music. `Automatiskt` läser
  landet ur sidans adress, annars ur webbläsarens språk.

Klick på tilläggets ikon i verktygsfältet visar en banner du stängt igen.

## Hur matchningen fungerar, och var gränsen går

Det här är kärnan i vad tillägget kan och inte kan.

| Tjänst | Publikt API utan nyckel? | Resultat |
|---|---|---|
| Apple Music | ja — `itunes.apple.com`, CORS öppet | **direktlänk till utgåvan** |
| Deezer | ja — `api.deezer.com`, CORS öppet | **direktlänk till utgåvan** |
| Spotify | nej, kräver OAuth | förifylld sökning |
| TIDAL | nej, kräver client secret | förifylld sökning |
| YouTube Music | nej, inget publikt API | förifylld sökning |
| Amazon Music | nej, inget publikt API | förifylld sökning |

Odesli/song.link — den uppenbara genvägen — går inte att använda: deras publika
API svarar numera `401 PUBLIC_API_ACCESS_DEPRECATED`.

För de två tjänster som går att slå upp:

1. Artist och titel läses från sidan. På Apple Music och Deezer hämtas de i
   stället från tjänstens eget API via id:t i adressen, vilket är exakt och
   oberoende av språkinställning.
2. Utgåvetillägg städas bort före sökningen — `(Deluxe Edition)`,
   `[Remastered]`, `- 2011 Remaster`, `(Disk 2)`, `feat. …`. Utan det hittar
   API:erna ingenting alls för ett deluxe-album, eftersom den utgåvan ofta inte
   finns i den andra katalogen.
3. Kandidaterna poängsätts på artist och titel (Sørensen–Dice på teckenbigram,
   diakriter normaliserade). Fel artist diskvalificerar direkt.
4. **Titeln måste hålla på egen hand.** `(Live)`, `(Demo)` och liknande städas
   medvetet *inte* bort — det är andra inspelningar. Utan den spärren matchade
   Björks *Homogenic* mot *Homogenic (Live)* och presenterades som exakt träff.
5. Vid lika poäng vinner den minst utsmyckade titeln, så huvudutgåvan slår
   bonusskivan.
6. En för svag träff nedgraderas till en sökning i stället för att skicka dig
   fel. Knappen visar `exakt` eller `sök` så du ser vilket du får.

## Integritet

Artist och titel som lästs från sidan skickas bara till `itunes.apple.com` och
`api.deezer.com`, och bara för att slå upp en träff. Inget skickas någon
annanstans. Ingen historik sparas; träffar cachas i minnet i en timme och
försvinner när webbläsaren stänger.

## Filer

```
manifest.json               MV3, inga ES-moduler (allt hänger på globalThis.OMI)
src/common/services.js      tjänsteregister: URL-tolkning + sök-URL:er
src/common/normalize.js     titelnormalisering, likhetspoäng, kandidatval
src/common/settings.js      lagring och regionslogik
src/background/             service worker + katalogupplsagningar
src/content/                URL-bevakning, metadataläsning, bannern
src/options/                inställningssidan
```

Alla nätanrop görs i service workern, aldrig i content-scriptet: ett `fetch`
därifrån ärver sidans CORS-origin och CSP, och Spotifys `connect-src` skulle
blockera `itunes.apple.com`.

## Webbläsarstöd

Chrome-tillägg, MV3 — enda målet är Chrome. Baseline newly available-funktioner
får därför användas utan fallbacks eller polyfills.

## Utveckling

```bash
node test/run-tests.js          # URL-tolkning och sök-URL:er, offline
```

```bash
node test/run-tests.js --live   # samma, plus riktiga anrop mot båda API:erna
```

Förhandsgranska gränssnittet utan att installera tillägget (`chrome.*` stubbas,
de riktiga käll­filerna laddas):

```bash
python3 -m http.server 8731
```

Sen `http://localhost:8731/test/preview-banner.html?locale=sv` och
`http://localhost:8731/test/preview-options.html?locale=sv` (`locale=en` funkar
också).

## Publicering i Web Store

Koden är skriven Store-klar: manifest v3, minimala behörigheter (`storage` plus
värdbehörighet enbart för de två API:erna), ikoner i alla storlekar, och all
text via `_locales` (engelska som standard, svenska följer webbläsarspråket).

```bash
./tools/package.sh
```

Skriptet lägger en zip i `dist/` med `test/`, `tools/`, `dist/`, `.claude/` och
`README.md` uteslutna.

Integritetspolicyn ligger publikt på <https://bastiman85.github.io/OpenMusicIn/privacy.html>, serverad av GitHub Pages ur
`docs/` på `main`. Kör `python3 tools/build-privacy-page.py` och pusha efter
varje ändring i `PRIVACY.md` — Pages bygger om vid push.

Butiksmaterial genereras med `python3 tools/make-store-assets.py` till
`store-assets/`, och den publicerbara integritetspolicyn med
`python3 tools/build-privacy-page.py` till `docs/privacy.html`.

Store-listningen underhålls i `CHROMEWEBSTORE.md` — beskrivningar, motiveringar
för varje behörighet, datadeklaration och versionshistorik samlat, att kopiera
in i Developer Dashboard. Integritetspolicyns text ligger i `PRIVACY.md`.

Kvar innan en inlämning är möjlig: publicera `PRIVACY.md` på en stabil publik
URL, ta skärmbilderna som beskrivs i `CHROMEWEBSTORE.md`, och fylla i utgivare
och kontaktadress. Google tar dessutom ut en engångsavgift på 5 USD för
utvecklarkontot.

## Kända begränsningar

- YouTube Music och Amazon Music har inga stabila publika API:er *eller* stabil
  markup. Metadata läses ur DOM:en med flera reservselektorer och nya försök
  under några sekunder, men en tillräckligt stor omdesign hos dem kan bryta
  läsningen. Undantag: YouTube Musics artistsidor serverrenderar `og:`-taggar
  och läses därifrån. De används bara när `og:url` fortfarande pekar på sidan
  man är på — appen skriver inte nödvändigtvis om `<head>` vid navigering inuti
  sig själv, och gamla taggar skulle annars namnge fel artist. Övriga fyra tjänster läses ur `og:`-taggar, JSON-LD eller
  tjänstens eget API och är betydligt tåligare.
- Bannern skjuter ned sidan i stället för att täcka den. Det görs med en
  `transform` på rotelementet, inte med padding: alla sex tjänsterna fäster sin
  egen navigering med `position: fixed`, och den ligger kvar under bannern om
  man bara lägger på padding. En transform på `<html>` gör rotelementet till
  containing block även för sidans fasta element, så hela sidan flyttas ned
  samlat. Bannern kompenserar för förskjutningen via `--omi-top`, och höjden
  följs med en `ResizeObserver` eftersom knapparna radbryts i smala fönster.
  Vid stängning tas allt bort och sidan återställs helt.
- Rotelementet får `height: calc(100% - h)`, inte bara `min-height`. Alla sex
  apparna sätter `html { height: 100% }`, så rotboxen förblir annars en hel
  viewport hög; förskjuten nedåt hamnar dess underkant `h` px under fönstret,
  och tjänstens egen spelarlist med `bottom: 0` följer med ut ur bild. Det var
  precis vad som hände i YouTube Music när man startade en låt utan att öppna
  helskärmsvyn.
- En `transform` på rotelementet når inte ättlingar som är dimensionerade med
  `100vh` — viewport-enheter struntar i förfäderna. Apple Music bygger sitt skal
  som ett viewporthögt rutnät vars sista rad är deras egen banner, så pushen
  sköt den raden rakt ur bild trots att `html` krympte korrekt. Spotify och
  YouTube Music visade aldrig detta eftersom deras chrome är `position: fixed`,
  vilket transformen hanterar. Det finns ingen selektor för "satt med 100vh", så
  tillägget mäter i stället: allt som är exakt viewporthögt markeras med
  `data-omi-vh` innan transformen appliceras, och pushens stilmall drar av
  bannerns höjd från dem.
- Bieffekt av samma transform: på en sida där *dokumentet* scrollar beter sig
  `position: fixed` som `absolute` och följer med scrollen. Alla sex tjänsterna
  är app-skal där inre containrar scrollar och dokumentet står stilla, så det
  märks inte där — men det är värt att känna till om fler tjänster läggs till.
- Landskoden påverkar bara Apple Music och Amazon Music. Övriga tjänster har
  landsoberoende sök-URL:er.
