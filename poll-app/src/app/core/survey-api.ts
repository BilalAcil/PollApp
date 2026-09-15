import { inject, Injectable } from '@angular/core';

import { NewSurvey, OptionResult, Survey, SurveyWithQuestions } from '../models/survey.model';
import { Supabase } from './supabase';

/**
 * Sorts the nested questions and options of a survey by their "position"
 * column, since SQL does not guarantee row order on its own.
 */
function sortSurveyQuestions(survey: SurveyWithQuestions): SurveyWithQuestions {
  const survey_questions = [...survey.survey_questions]
    .sort((a, b) => a.position - b.position)
    .map((question) => ({
      ...question,
      survey_options: [...question.survey_options].sort((a, b) => a.position - b.position),
    }));
  return { ...survey, survey_questions };
}

/**
 * Single place for every database access the application performs.
 * Each method throws on failure so the calling component can show the message.
 */
@Injectable({
  providedIn: 'root',
})
export class SurveyApi {
  private readonly supabase: Supabase = inject(Supabase);

  /** Loads all surveys ordered by deadline, earliest first. */
  async loadSurveys(): Promise<Survey[]> {
    const { data, error } = await this.supabase.client
      .from('surveys')
      .select('*')
      .order('deadline', { ascending: true, nullsFirst: false });

    if (error) {
      throw new Error(`Umfragen konnten nicht geladen werden: ${error.message}`);
    }
    return data ?? [];
  }

  /**
   * Loads a single survey with its questions and answer options for the
   * detail view, or null if it does not exist.
   */
  async loadSurvey(id: string): Promise<SurveyWithQuestions | null> {
    const { data, error } = await this.supabase.client
      .from('surveys')
      .select('*, survey_questions(*, survey_options(*))')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new Error(`Umfrage konnte nicht geladen werden: ${error.message}`);
    }
    return data ? sortSurveyQuestions(data) : null;
  }

  /** Loads the answer options of a whole survey including their vote counts. */
  async loadResults(surveyId: string): Promise<OptionResult[]> {
    const { data, error } = await this.supabase.client
      .from('option_results')
      .select('*')
      .eq('survey_id', surveyId);

    if (error) {
      throw new Error(`Auswertung konnte nicht geladen werden: ${error.message}`);
    }
    return data ?? [];
  }

  /**
   * Stores one vote per selected option in a single request.
   * Counting happens when the results are loaded next.
   */
  async vote(optionIds: string[]): Promise<void> {
    const votes = optionIds.map((optionId) => ({ option_id: optionId }));
    const { error } = await this.supabase.client.from('votes').insert(votes);

    if (error) {
      throw new Error(`Stimme konnte nicht gespeichert werden: ${error.message}`);
    }
  }

  /**
   * Creates a survey together with its questions and answer options and
   * returns the new id. Delegates to the "create_survey" database function
   * so every insert shares one transaction: if any step fails, no
   * half-finished survey is left behind.
   */
  async createSurvey(input: NewSurvey): Promise<string> {
    const { data, error } = await this.supabase.client.rpc('create_survey', {
      p_title: input.title,
      p_category: input.category,
      p_questions: input.questions,
      p_description: input.description ?? null,
      p_deadline: input.deadline ?? null,
    });

    if (error || !data) {
      throw new Error(`Umfrage konnte nicht angelegt werden: ${error?.message}`);
    }
    return data as string;
  }
}
