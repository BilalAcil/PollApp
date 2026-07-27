/** A survey as stored in the "surveys" table. */
export interface Survey {
  id: string;
  title: string;
  category: string;
  description: string | null;
  /** ISO timestamp. null means the survey has no end date and runs indefinitely. */
  deadline: string | null;
  created_at: string;
}

/**
 * An answer option together with its current vote count.
 * Comes from the "option_results" view, which counts the votes in the database.
 */
export interface OptionResult {
  option_id: string;
  survey_id: string;
  label: string;
  vote_count: number;
}

/** The values collected by the "New Survey" form. */
export interface NewSurvey {
  /** Required. */
  title: string;
  /** Required. */
  category: string;
  /** Required, at least two entries. */
  options: string[];
  /** Optional. */
  description?: string | null;
  /** Optional ISO timestamp. */
  deadline?: string | null;
}
