# Coding Conventions

Vorgaben der Developer Akademie, die für die Abgabe erfüllt sein müssen.
Diese Datei ist die Textfassung der beiden Original-PDFs, die daneben liegen:

- `coding-convention-html.pdf` — „Coding Konvention für HTML“ (2025)
- `coding-konvention-typescript.pdf` — „Coding Konvention für TypeScript“ (2025)

Bei Abweichungen gelten die PDFs.

---

## HTML

### 1. Struktur und Semantik

- Nutze semantische Tags: `header`, `nav`, `main`, `section`, `article`, `aside`, `footer`
- Verwende `h1` bis `h6` in sinnvoller Hierarchie
- Benutze `section` für thematische Abschnitte
- Verwende `article` für eigenständige Inhalte
- Ergänze `aside` für Zusatzinfos, nicht für Layout
- Setze `figure` + `figcaption` für Bilder mit Bedeutung

### 2. Lesbarkeit und Wartbarkeit

- Einheitlich eingerückt und formatiert
- Keine tiefen, unübersichtlichen Verschachtelungen
- Verwende sprechende Namen (englisch)
- Verständliche, gepflegte Kommentare, die den Code ergänzen

### 3. Barrierefreiheit

- Bilder haben sinnvolle `alt`-Texte
- E-Mail-Adressen mit `mailto:`
- Tabellen haben `<caption>` (wenn sinnvoll), `<th>` statt nur `<td>` für
  Überschriften und eine korrekte logische Struktur
- Navigation als Liste (`<ul>` in `<nav>`)

### 4. Inhalte richtig kennzeichnen

- Wichtiges hervorheben mit `<strong>` oder `<em>`, nicht nur `<b>` oder `<i>`
- Inline-Textstruktur mit `<span>`
- Fließtext in `<p>`, nicht in `div`

### 5. Gültigkeit und Standards

- HTML-Dokument mit korrektem Doctype beginnen (`<!DOCTYPE html>`)
- Immer ein `<html lang="...">` setzen
- Im `<head>`: `meta charset="UTF-8"` und `<title>` nicht vergessen
- Eine `index.html` sollte immer ein Favicon erhalten

### 6. Best Practices

- So wenig `div` wie möglich und so viel wie nötig („div-Suppe“ vermeiden)
- Struktur (HTML) von Darstellung (CSS) trennen
- Kein Lorem Ipsum — eigene, sinnvolle Texte verwenden

### 7. Quellen

- <https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Accessibility/HTML>
- <https://www.semrush.com/blog/semantic-html5-guide/>

---

## TypeScript

### 1. Allgemein

- Dateinamen in kebab-case (`user-utils.ts`)
- **Max. 14 Zeilen pro Funktion**
- Semikolons verwenden
- Kein `any` verwenden (wenn möglich) — besser: exakter Typ oder `unknown`

### 2. Namensgebung

- Funktionen in camelCase (`getUser()`)
- Klassen in PascalCase (`UserProfile`)
- Interfaces in PascalCase (`User`)
- Konstanten in UPPER_CASE (`MAX_RETRIES`)
- Typen in PascalCase (`type UserId = string;`)

### 3. Formatierung

- 2 Leerzeichen für die Einrückung
- Imports gruppieren (Standard, Dritt, Lokal)
- Typen und Rückgabewerte explizit angeben

### 4. Kommentare

- TSDoc für Funktionen und Methoden (`/** Gibt den User zurück. */`)

### 5. Clean Code

- Eine Aufgabe pro Funktion
- Keine Magic Numbers — benannte Konstanten verwenden
- HTML auslagern statt inline (in Angular: `templateUrl` statt `template`)
- Lesbare Bedingungen (`if (isUserActive)` statt `if (x)`)

### 6. Quellen

Im PDF verlinkt: TSDoc (Kommentar-Standards), Airbnb Style Guide (Formatierung,
Einrückung, Namensgebung), TypeScript StyleGuide, Clean Code, Funktionslänge &
Funktionswirkung.
