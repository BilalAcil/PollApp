# Design System

Abgeleitet aus der Figma-Component-Library. **Die Farbwerte sind aus den
Screenshots geschätzt** und sollten durch die exakten Werte aus Figma ersetzt
werden, sobald sie vorliegen.

## Farben

| Rolle | Wert (geschätzt) | Verwendung |
| --- | --- | --- |
| Amber / Primär | `#F7A94A` | Primary Button, aktive Zustände, Ergebnis-Balken, Edit-Button |
| Amber hell (bestätigt) | `#FFB770` | Hero-Überschrift (`.hero-title`), Primary Button Hover |
| Amber soft (bestätigt) | `#FFCFA1` | Primary Button (`.btn-primary`) Ruhezustand |
| Peach hell | `#FBDCC0` | Secondary Button, Filter-Pills, „Ends in 1 Day", Hover-Zustände |
| Peach sehr hell | `#FDEEE0` | Hintergrund von Zeilen im Hover |
| Dunkel / Aubergine | `#372B4A` | Dunkle Panels, Karten in der Liste, Delete-Button |
| Dunkel tiefer (bestätigt) | `#35273A` | Homescreen-Hintergrund |
| Lavendel hell | `#F0E8F7` | Highlights-Card Hintergrund |
| Weiß | `#FFFFFF` | Input-Felder, Karten auf hellem Grund |
| Text dunkel | `#1E1B29` | Fließtext auf hellem Grund |
| Text auf dunkel | `#FFFFFF` | Titel in dunklen Karten |
| Label amber | `#F7A94A` | Kategorie-Label in dunklen Karten |
| Track grau | `#E9E7EF` | Hintergrund der Ergebnis-Balken |

## Typografie

| Rolle | Schrift | Schnitte | Verwendung |
| --- | --- | --- | --- |
| Display | Nerko One | Regular (400) | Überschriften, Logo, „LIVE"-Label |
| Fließtext | Mulish | Regular (400), SemiBold (600), Bold (700) | Fließtext, Labels, Buttons |

Beide sind Google Fonts, lokal eingebunden (kein externer CDN-Aufruf) als
WOFF2 in `poll-app/public/fonts/`, per `@font-face` in `src/styles.scss`
registriert. CSS-Variablen `--font-display` und `--font-body` stehen auf
`:root` bereit.

## Formen

- Buttons und Pills: vollrund (`border-radius: 999px`)
- Karten und Panels: ca. 12–16 px Radius
- Input-Felder: vollrund
- Checkboxen: eckig mit kleinem Radius

## Komponenten-Inventar

### Buttons

- **Primary** — amber, dunkler Text, vollrund; Varianten schlicht, mit `+`-Icon,
  mit `✓`-Icon
- **Secondary** — heller Peach-Hintergrund („Add option")
- **Tertiary** — auf dunklem Grund, unterstrichen bzw. mit Rahmen („Add answer ⊕")
- **Filter** — Peach-Pill („Past survey")
- **Icon-Buttons** — Delete (dunkles Quadrat, Mülleimer), Edit (amber, Stift)

### Statusanzeigen

- **Survey status**: `Published` (amber), `Draft` (heller Peach)
- **Deadline-Pill**: „Ends in 1 Day", Peach, unten rechts in der Karte

### Karten

- **Highlights-Card** — heller Lavendel-Hintergrund, Kategorie-Label klein oben,
  großer fetter Titel, Deadline-Pill unten links
- **Survey view in the list** — dunkle Karte, Kategorie-Label in Amber, weißer
  fetter Titel, Deadline-Pill unten rechts

Beide Kartentypen haben oben rechts eine **stark abgerundete Ecke**. Dieselbe
Form wiederholt sich am Erstellen-Dialog, an der Detailansicht-Karte und am
Bestätigungs-Overlay — sie ist das prägende Formmerkmal des Entwurfs.

### Formulare

- **Input field** — weiß, vollrund; Fokus-Zustand mit Peach-Füllung; Placeholder
- **Checkbox** — Zustände: leer, Hover, aktiv (amber mit Häkchen)
- **Answer row** — Checkbox + Text, Hover in Peach, ausgewählt mit amber Häkchen
- **Dropdown** — „Sort by" in mehreren Varianten (hell/amber, Pfeil auf/ab)
- **Dropdown mit Menü** — amber Kopfzeile „Sort by categories", darunter Liste
- **Create question** — dunkles Panel: nummerierte Frage, Input, Antwortfelder
  A./B./C. mit Lösch-Icon, „Add answer ⊕", Hinweis „You can add up to 6 answer
  fields."

### Ergebnisse

- Zeilen A–D mit horizontalem Balken und Prozentwert rechts
- Balken amber auf grauem Track

### Logo

„Poll App" mit Sprechblasen-Icon, zwei Varianten für hellen und dunklen Grund.

Beide liegen in `poll-app/public/images/`:

- `logo-on-dark.png` — peachfarben, für dunklen Grund (Homescreen-Header)
- `logo-on-light.png` — Aubergine, für hellen Grund (Header der Detailansicht)

### Hero-Illustration

Handy-Mockup mit Sprechblase, Stern-, Fragezeichen- und Häkchen-Kreis, siehe
Abschnitt „Hinweis aus der Vorlage". Zwei PNGs in `poll-app/public/images/`:

- `hero-illustration-resting.png` — Ruhezustand, Icons dicht am Handy
- `hero-illustration-hover.png` — Hover-Zustand, Icons weiter auseinander

Vom Benutzer bestätigt. Die einzelnen Ebenen (Sprechblase, Stern-Kreis usw. als
eigene SVGs) liegen nicht vor — für eine echte gestaffelte Hover-Animation
bräuchte es die Einzelteile statt der beiden fertigen Composings. Ohne sie:
Umschalten zwischen den zwei fertigen PNGs bei `:hover`.

## Kategorien

Feste Liste laut Dropdown-Menü:

- Team Activities
- Health & Wellness
- Gaming & Entertainment
- Education & Learning
- Lifestyle & Preferences
- Technology & Innovation

## Ansichten

### Homescreen

- **Hero** — Logo oben links, Display-Überschrift „Collect Feedback, Unlock
  Ideas", Fließtext, Primary-Button „New survey", Illustration rechts
- **„Your surveys"** als zentrierte Display-Überschrift
- **„Ending soon surveys"** — drei Highlights-Cards nebeneinander, Deadline-Pill
  unten links
- **Tabs** „Active survey" (amber, aktiv) und „Past survey" (weiß, inaktiv),
  rechts daneben das Dropdown „Sort by categories"
- **Liste** — zweispaltiges Raster dunkler Karten, Deadline-Pill unten rechts,
  eigener Scrollbereich

### Erstellen-Dialog (Overlay)

Dunkles Panel mit abgerundeter Ecke oben rechts, `Draft`-Badge oben links,
Display-Überschrift „Create new survey", „Cancel ✕" oben rechts, „Publish"
unten rechts.

- Kopfbereich zweispaltig: links `Survey name` (Pflicht), `Set end date`
  (optional) und `Choose category`; rechts `Describing text` (optional)
- Jedes Eingabefeld hat ein Lösch-Icon daneben
- Fragen-Blöcke nummeriert, je mit Fragetext, Checkbox „Allow multiple answers.",
  Antwortfeldern A./B./… und „Add answer ⊕"
- **Maximal 6 Antwortoptionen pro Frage** — danach wird „Add answer" inaktiv
- „Add next question ⊕" steht neben dem letzten Fragen-Block, solange nur eine
  Frage existiert, danach unterhalb

### Detailansicht (eigene Route)

Kopfzeile mit Logo links und „Create survey" rechts. Darunter zwei Spalten:

- **Links** — helle Lavendel-Karte mit abgerundeter Ecke oben rechts:
  `Published`-Badge, „Ends on TT.MM.JJJJ", „Category: …", Display-Titel,
  Beschreibung, Fragen im zweispaltigen Raster mit Checkboxen, Button
  „Complete survey" unten rechts
- **Rechts** — „Survey results **LIVE**"; vor der ersten Stimme ein Leerzustand,
  danach je Frage Balken A–E mit Prozentwert

### Bestätigungs-Overlay

Nach „Publish" erscheint „Your survey is now published" mit Schließen-Kreuz.
Nach dem Schließen landet der Benutzer in der neu erstellten Umfrage.

## Mobile-Layouts

Für alle drei Ansichten liegen eigene Entwürfe vor. Gemeinsames Muster: alles
wird einspaltig, und die Auswertung wandert unter die Abstimmung.

### Homescreen

- Logo oben links, darunter die Display-Überschrift dreizeilig
- **Die Illustration steht unter der Überschrift**, nicht daneben, und bleibt
  sichtbar
- Button „New survey" trägt hier ein `⊕`-Icon
- „Ending soon surveys" **scrollt horizontal** — die nächste Karte ragt
  angeschnitten ins Bild
- Tabs und Kategorie-Dropdown stehen untereinander statt nebeneinander
- Die Umfrageliste ist einspaltig

### Erstellen-Dialog

- Füllt den Bildschirm; das Logo steht darüber
- Schließen-Kreuz als eigener Button oben rechts, `Draft`-Badge oben links
- **Andere Feldreihenfolge als auf Desktop**: Survey name → Choose category →
  Set end date → Describing text
- Die Lösch-Icons sitzen auf Höhe der Beschriftung, nicht neben dem Feld
- „Add next question" und „Publish" sind zentriert; „Publish" trägt ein
  `✓`-Icon

### Detailansicht

- Statt „Create survey" steht oben rechts in der Karte ein **Schließen-Kreuz**
- „Ends on …" und „Category: …" stehen nebeneinander in einer Zeile
- Fragen einspaltig untereinander
- Der Button heißt verkürzt „Complete ✓"
- **Die Auswertung liegt unter der Karte und ist aufklappbar** — im
  eingeklappten Zustand „See results ▼", im ausgeklappten „Close results ▲"

### Results-Component

Der aufklappbare Ergebnisbereich ist eine eigene Komponente mit zwei Zuständen
(„See results" / „Close results"). Auf Desktop steht die Auswertung dauerhaft
offen rechts neben der Abstimmung — so verlangt es auch die Abgabe-Checkliste
(User Story 5).

## Verhalten der Lösch-Icons

Aus der Vorlage übernommen:

- Das Icon bei **Frage 1** leert nur die Eingabefelder.
- Das Icon bei **jeder weiteren Frage** entfernt den ganzen Fragen-Block.
- Eine Umfrage hat immer mindestens eine Frage — Frage 1 ist nicht löschbar.

## Hinweis aus der Vorlage

Die Illustration mit den Telefon-Mockups hat eine Hover-Interaktion **nur auf
Desktop**. Auf Tablet und Mobile ausdrücklich keine Interaktion.

## Abweichungen von der Vorlage

Bewusste Korrekturen beim Nachbau:

- Plural der Deadline-Pill wird korrekt gebildet („Ends in 3 Days", die Vorlage
  zeigt an einer Stelle „Ends in 3 Day").
- Tippfehler werden korrigiert: „There are no answears yet." → „answers";
  „More than one answers are possible." → „More than one answer is possible."
- Prozentwerte stammen aus echten Stimmen, nicht aus den Zahlen der Vorlage.

## Offene Punkte

- **Schriftart** — Display-Schrift und Fließtext-Schrift aus Figma noch unbekannt.
- **Assets** — Logo (hell/dunkel) und Hero-Illustration fehlen in
  `poll-app/public/`.
