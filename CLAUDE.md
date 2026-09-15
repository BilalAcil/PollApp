# PollApp

Diplomarbeit-Projekt (Developer Akademie). Angular 21 SPA im Unterordner `poll-app/`,
ohne SSR, Build-Ausgabe nach `poll-app/dist/poll-app/browser/`.

## Befehle

Alle Befehle im Ordner `poll-app/` ausführen:

| Befehl | Zweck |
| --- | --- |
| `ng serve` | Dev-Server auf http://localhost:4200 |
| `ng build` | Produktions-Build |
| `ng test` | Unit-Tests |
| `ng generate component <name>` | Neue Komponente anlegen |

## Arbeitsweise

- Claude bearbeitet Dateien direkt.
- **Git bleibt beim Nutzer**: keine `git add` / `commit` / `push` durch Claude.
- Antworten auf Deutsch. Neue Konzepte kurz erklären — das Projekt muss vom
  Autor verstanden und verteidigt werden können.

## Abgabe-Checkliste

Alle Punkte müssen vor der Einreichung erfüllt sein. Zusätzlich eingebaute Extras
werden bei der Abgabe kurz erwähnt, damit die Mentoren sie ansehen können.

Quelle: `docs/poll-app-checkliste.pdf` (Developer Akademie, 2026). Diese Liste ist die
wortgetreue Übernahme — bei Abweichungen gilt das PDF.

### User Story 1 — Dringende Umfragen erkennen

> Als Benutzer möchte ich besonders dringende Umfragen sofort erkennen können,
> damit ich keine bald endenden Umfragen verpasse.

- [ ] Über der allgemeinen Umfragen-Liste werden **„bald endende“ Umfragen** angezeigt.
- [ ] Die Umfragen werden chronologisch nach Enddatum sortiert (frühestes Ende zuerst).

### User Story 2 — Übersicht auf dem Homescreen

> Als Benutzer möchte ich auf dem Homescreen eine übersichtliche Liste aller
> verfügbaren Umfragen sehen, damit ich schnell eine passende Umfrage auswählen kann.

- [ ] Auf dem Homescreen werden die Umfragen angezeigt.
  - [ ] Es gibt einen Reiter, der die Anzeige zwischen **laufenden** und
        **abgeschlossenen** Umfragen wechselt.
  - [ ] In den Testdaten liegen **auch bereits abgelaufene Umfragen**, damit der
        Reiter „abgeschlossen“ überhaupt testbar ist.
- [ ] Jede Umfrage zeigt mindestens:
  - [ ] Kategorie der Umfrage
  - [ ] Titel der Umfrage
  - [ ] Deadline der Umfrage
- [ ] Die Umfragen lassen sich **nach Kategorien filtern**.
  - [ ] Der Filter greift **getrennt** bei den laufenden und bei den abgeschlossenen
        Umfragen — die beiden Listen dürfen sich nicht vermischen.
  - [ ] Der Filter lässt sich wieder auf **„Alle“** zurückstellen.

### User Story 3 — Umfragen erstellen

> Als Benutzer möchte ich neue Umfragen erstellen können, damit ich eigene
> Abstimmungen anlegen kann.

- [ ] Auf dem Homescreen gibt es einen **„New Survey“-Button**.
- [ ] Beim Klick öffnet sich ein **Dialog / Modal** zur Erstellung einer neuen Umfrage.
      **Achtung:** Dialog / Modal bedeutet **Overlay** — ausdrücklich **keine eigene
      Route**.
- [ ] Das Formular unterscheidet klar zwischen:
  - [ ] **Pflichtangaben** (z. B. Titel, Antwortoptionen)
  - [ ] **optionalen Angaben** (z. B. Beschreibung, Deadline)
  - [ ] Pflichtfelder sind eindeutig gekennzeichnet und werden validiert.

### User Story 4 — Detailansicht

> Als Benutzer möchte ich eine laufende Umfrage öffnen können, um Details zu sehen
> und an der Abstimmung teilzunehmen.

- [ ] Durch Klick auf eine **Umfrage** wird eine Detailansicht geöffnet.
- [ ] In der Detailansicht werden angezeigt:
  - [ ] die Fragestellung
  - [ ] die Antwortoptionen
  - [ ] relevante Zusatzinformationen
  - [ ] der aktuelle Stand der Auswertung — die Anzeige verändert sich **live, also
        in Echtzeit** (Supabase Realtime), nicht erst nach einem Reload oder nach der
        eigenen Stimmabgabe.
- [ ] Beendete Umfragen sind unter „Past Surveys“ gelistet und lassen sich weiterhin
      **öffnen und einsehen**. Nur die Antwortoptionen darin sind **nicht mehr
      klickbar** — es kann keine Stimme mehr abgegeben werden.

### User Story 5 — Abstimmen mit Live-Auswertung

> Als Benutzer möchte ich an einer Umfrage teilnehmen und gleichzeitig die aktuelle
> Auswertung sehen können, um das Ergebnis besser einschätzen zu können.

- [ ] In der Umfrageansicht kann der Benutzer **abstimmen** (Klick auf eine Option).
- [ ] Während der Abstimmung wird die **aktuelle Auswertung** angezeigt.
- [ ] Die Auswertung befindet sich **rechts neben der Abstimmung** (Desktop-Layout).
- [ ] Die Ergebnisse aktualisieren sich **dynamisch** nach einer abgegebenen Stimme.

### Code Conventions

Volltext beider Vorgaben: `docs/coding-conventions.md`. **Vor jeder neuen Datei lesen.**
Die Original-PDFs liegen daneben in `docs/` (`coding-convention-html.pdf`,
`coding-konvention-typescript.pdf`).

- [ ] Coding-Konvention für HTML umgesetzt
- [ ] Coding-Konvention für TypeScript umgesetzt

**Zusätzliche Hausregel:** Kommentare ausschließlich auf **Englisch**, und **keine
Inline-Kommentare** — weder am Zeilenende noch innerhalb von Funktionsrümpfen.
Erklärungen gehören in einen TSDoc-Block über der Deklaration. Verlangt eine
Codezeile einen Kommentar, ist das ein Hinweis auf einen besseren Namen oder eine
eigene Funktion. Texte, die der Benutzer sieht (Fehlermeldungen, Labels), bleiben
deutsch.

Die Regeln, die im Alltag am häufigsten verletzt werden:

- **Max. 14 Zeilen pro Funktion** — längere Methoden aufteilen.
- Kein `any`; Typen und Rückgabewerte immer explizit angeben.
- TSDoc (`/** … */`) über jeder Funktion und Methode.
- Dateinamen in kebab-case, 2 Leerzeichen Einrückung, Semikolons.
- Keine Magic Numbers — benannte Konstante in UPPER_CASE.
- Im HTML semantische Tags statt `div`-Suppe; Templates immer per `templateUrl`
  auslagern, nie inline.

## Backend: Supabase

Die Datenhaltung läuft über **Supabase** (Vorgabe, nicht verhandelbar).

- Client-Bibliothek: `@supabase/supabase-js`
- Zugangsdaten (Project URL + Publishable key) liegen in `src/environments/`.
- Supabase nutzt das neue Key-Schema: **Publishable key** (`sb_publishable_…`,
  früher „anon key“) fürs Frontend, **Secret key** (`sb_secret_…`, früher
  „service_role“) ausschließlich serverseitig.
- Der **Publishable key ist öffentlich** und darf im Repo stehen — die Absicherung
  passiert über Row Level Security (RLS) in Supabase, nicht über Geheimhaltung
  des Keys. Der Secret key gehört **niemals** ins Frontend oder ins Repo.
- RLS muss auf allen Tabellen aktiviert sein, sonst kann jeder beliebige Daten
  löschen, sobald die App online ist.

### Tabellen

Das vollständige SQL liegt in `supabase/schema.sql` — einmal in den Supabase
SQL Editor einfügen und ausführen. `supabase/seed.sql` legt danach Testdaten
an, darunter eine bereits abgelaufene Umfrage (für den „Past"-Reiter).

Eine Umfrage enthält **mehrere Fragen**, jede Frage mehrere Antwortoptionen.
Deshalb liegt zwischen `surveys` und `survey_options` die Tabelle
`survey_questions`.

- `surveys` — id, title, description, category, deadline, created_at
- `survey_questions` — id, survey_id (FK), text, position, allow_multiple
- `survey_options` — id, question_id (FK), label, position
- `votes` — id, option_id (FK), created_at
- `option_results` — View, zählt die Stimmen pro Option
- `create_survey(...)` — Datenbankfunktion, legt Umfrage + Fragen + Optionen
  in einer Transaktion an

RLS-Policies erlauben Lesen und Anlegen für alle (kein Login), aber kein
Ändern oder Löschen — dafür existiert bewusst keine Policy.

## Getroffene Entscheidungen

Grundlage ist der Figma-Entwurf, festgehalten in `docs/design-system.md`.

- **Mehrere Fragen pro Umfrage** — siehe Tabellen oben.
- **Mehrfachauswahl pro Frage** über `allow_multiple`; die Detailansicht zeigt
  dann den Hinweis „More than one answer is possible".
- **Abstimmung wird gesammelt abgegeben** — der Benutzer hakt alle Fragen an und
  bestätigt einmal mit „Complete survey". Erst danach erscheint die Auswertung.
- **Oberflächensprache Englisch**, dazu ein Sprachumschalter (Flaggen oben
  rechts) für Deutsch. Die Wahl wird in `localStorage` gespeichert und überdauert
  einen Seitenbesuch. Deshalb darf **kein sichtbarer Text fest im Template
  stehen** — alle Labels kommen aus einer Übersetzungsdatei.
- **`Published` / `Draft` ist nur ein Zustandslabel**, kein Feature: Es gibt
  keinen „Als Entwurf speichern"-Button, also auch keine Spalte dafür.

## Offene Entscheidungen

- **Styling:** Noch nicht festgelegt (pures CSS vs. Framework).
- **Doppelte Stimmabgabe:** Ohne Login schwer zu verhindern. Einfachste Lösung:
  abgegebene Stimme in `localStorage` merken.
- **Assets:** Logo und Hero-Illustration liegen noch nicht in `poll-app/public/`.

Schriftarten sind gesetzt: Nerko One (Display) und Mulish (Fließtext), siehe
`docs/design-system.md`.
