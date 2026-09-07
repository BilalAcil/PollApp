# Design System

Abgeleitet aus der Figma-Component-Library. **Die Farbwerte sind aus den
Screenshots geschätzt** und sollten durch die exakten Werte aus Figma ersetzt
werden, sobald sie vorliegen.

## Farben

| Rolle | Wert (geschätzt) | Verwendung |
| --- | --- | --- |
| Amber / Primär | `#F7A94A` | Primary Button, aktive Zustände, Ergebnis-Balken, Edit-Button |
| Peach hell | `#FBDCC0` | Secondary Button, Filter-Pills, „Ends in 1 Day", Hover-Zustände |
| Peach sehr hell | `#FDEEE0` | Hintergrund von Zeilen im Hover |
| Dunkel / Aubergine | `#372B4A` | Dunkle Panels, Karten in der Liste, Delete-Button |
| Dunkel tiefer | `#2B2039` | Panel-Hintergrund |
| Lavendel hell | `#F0E8F7` | Highlights-Card Hintergrund |
| Weiß | `#FFFFFF` | Input-Felder, Karten auf hellem Grund |
| Text dunkel | `#1E1B29` | Fließtext auf hellem Grund |
| Text auf dunkel | `#FFFFFF` | Titel in dunklen Karten |
| Label lavendel | `#C9B8DE` | Kategorie-Label in dunklen Karten |
| Track grau | `#E9E7EF` | Hintergrund der Ergebnis-Balken |

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
- **Survey view in the list** — dunkle Karte, Kategorie-Label in Lavendel,
  weißer fetter Titel, Deadline-Pill unten rechts

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

## Kategorien

Feste Liste laut Dropdown-Menü:

- Team Activities
- Health & Wellness
- Gaming & Entertainment
- Education & Learning
- Lifestyle & Preferences
- Technology & Innovation

## Hinweis aus der Vorlage

Die Illustration mit den Telefon-Mockups hat eine Hover-Interaktion **nur auf
Desktop**. Auf Tablet und Mobile ausdrücklich keine Interaktion.

## Offene Punkte

Diese Elemente stehen in der Vorlage, aber nicht in der Abgabe-Checkliste. Sie
brauchen jeweils eine Entscheidung, teils mit Auswirkung auf die Datenbank:

- **„Allow multiple answers"** — Mehrfachauswahl pro Umfrage. Bräuchte eine
  Spalte in `surveys` und eine andere Auswertungslogik.
- **`Published` / `Draft`** — Status einer Umfrage. Bräuchte eine Spalte in
  `surveys`.
- **Maximal 6 Antwortoptionen** — bisher nicht begrenzt.
- **Sortierung / Filter nach Kategorie** — bisher nicht vorgesehen.
- **Schriftart** — aus den Screenshots nicht sicher bestimmbar.
