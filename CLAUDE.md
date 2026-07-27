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
- [ ] Jede Umfrage zeigt mindestens:
  - [ ] Kategorie der Umfrage
  - [ ] Titel der Umfrage
  - [ ] Deadline der Umfrage

### User Story 3 — Umfragen erstellen

> Als Benutzer möchte ich neue Umfragen erstellen können, damit ich eigene
> Abstimmungen anlegen kann.

- [ ] Auf dem Homescreen gibt es einen **„New Survey“-Button**.
- [ ] Beim Klick öffnet sich ein **Dialog / Modal / separates Formular** zur Erstellung
      einer neuen Umfrage.
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
  - [ ] der aktuelle Stand der Auswertung
- [ ] Beendete Umfragen sind **nicht mehr klickbar** und unter „Past Surveys“ gelistet.

### User Story 5 — Abstimmen mit Live-Auswertung

> Als Benutzer möchte ich an einer Umfrage teilnehmen und gleichzeitig die aktuelle
> Auswertung sehen können, um das Ergebnis besser einschätzen zu können.

- [ ] In der Umfrageansicht kann der Benutzer **abstimmen** (Klick auf eine Option).
- [ ] Während der Abstimmung wird die **aktuelle Auswertung** angezeigt.
- [ ] Die Auswertung befindet sich **rechts neben der Abstimmung** (Desktop-Layout).
- [ ] Die Ergebnisse aktualisieren sich **dynamisch** nach einer abgegebenen Stimme.

### Code Conventions

Volltext beider Vorgaben: `docs/coding-conventions.md`. **Vor jeder neuen Datei lesen.**

- [ ] Coding-Konvention für HTML umgesetzt
- [ ] Coding-Konvention für TypeScript umgesetzt

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

### Geplante Tabellen

- `surveys` — id, title, description, category, deadline, created_at
- `survey_options` — id, survey_id (FK), label
- `votes` — id, option_id (FK), created_at

## Offene Entscheidungen

- **Styling:** Noch nicht festgelegt (pures CSS vs. Framework).
- **Doppelte Stimmabgabe:** Ohne Login schwer zu verhindern. Einfachste Lösung:
  abgegebene Stimme in `localStorage` merken.
