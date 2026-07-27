/** Eine Umfrage, so wie sie in der Tabelle "surveys" liegt. */
export interface Survey {
  id: string;
  title: string;
  category: string;
  description: string | null;
  /** ISO-Zeitstempel. null bedeutet: kein Enddatum, läuft unbegrenzt. */
  deadline: string | null;
  created_at: string;
}

/**
 * Eine Antwortoption samt aktueller Stimmenzahl.
 * Kommt aus der View "option_results", die das Zählen in der Datenbank erledigt.
 */
export interface OptionResult {
  option_id: string;
  survey_id: string;
  label: string;
  vote_count: number;
}

/** Die Eingaben aus dem "New Survey"-Formular. */
export interface NewSurvey {
  /** Pflichtfeld */
  title: string;
  /** Pflichtfeld */
  category: string;
  /** Pflichtfeld: mindestens zwei Optionen */
  options: string[];
  /** optional */
  description?: string | null;
  /** optional, ISO-Zeitstempel */
  deadline?: string | null;
}
