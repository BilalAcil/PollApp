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

/** One selectable answer, as stored in the "survey_options" table. */
export interface SurveyOption {
  id: string;
  question_id: string;
  label: string;
  position: number;
}

/** One question of a survey, as stored in the "survey_questions" table. */
export interface SurveyQuestion {
  id: string;
  survey_id: string;
  text: string;
  position: number;
  allow_multiple: boolean;
}

/** A question together with its answer options, for the detail view. */
export interface QuestionWithOptions extends SurveyQuestion {
  survey_options: SurveyOption[];
}

/** A survey together with all its questions and their answer options. */
export interface SurveyWithQuestions extends Survey {
  survey_questions: QuestionWithOptions[];
}

/**
 * An answer option together with its current vote count.
 * Comes from the "option_results" view, which counts the votes in the database.
 */
export interface OptionResult {
  option_id: string;
  question_id: string;
  survey_id: string;
  label: string;
  vote_count: number;
}

/** One question as entered in the "New Survey" form. */
export interface NewSurveyQuestion {
  /** Required. */
  text: string;
  /** Required, at least two entries, at most six. */
  options: string[];
  allow_multiple: boolean;
}

/** The values collected by the "New Survey" form. */
export interface NewSurvey {
  /** Required. */
  title: string;
  /** Required. */
  category: string;
  /** Required, at least one entry. */
  questions: NewSurveyQuestion[];
  /** Optional. */
  description?: string | null;
  /** Optional ISO timestamp. */
  deadline?: string | null;
}
