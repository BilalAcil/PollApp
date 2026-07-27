import { inject, Injectable } from '@angular/core';

import { NewSurvey, OptionResult, Survey } from '../models/survey.model';
import { Supabase } from './supabase';

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

  /** Loads a single survey for the detail view, or null if it does not exist. */
  async loadSurvey(id: string): Promise<Survey | null> {
    const { data, error } = await this.supabase.client
      .from('surveys')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new Error(`Umfrage konnte nicht geladen werden: ${error.message}`);
    }
    return data;
  }

  /** Loads the answer options of a survey including their vote counts. */
  async loadResults(surveyId: string): Promise<OptionResult[]> {
    const { data, error } = await this.supabase.client
      .from('option_results')
      .select('*')
      .eq('survey_id', surveyId)
      .order('label', { ascending: true });

    if (error) {
      throw new Error(`Auswertung konnte nicht geladen werden: ${error.message}`);
    }
    return data ?? [];
  }

  /** Stores a single vote. Counting happens when the results are loaded next. */
  async vote(optionId: string): Promise<void> {
    const { error } = await this.supabase.client
      .from('votes')
      .insert({ option_id: optionId });

    if (error) {
      throw new Error(`Stimme konnte nicht gespeichert werden: ${error.message}`);
    }
  }

  /**
   * Creates a survey together with its answer options and returns the new id.
   * Delegates to the "create_survey" database function so both inserts share one
   * transaction: if either step fails, no half-finished survey is left behind.
   */
  async createSurvey(input: NewSurvey): Promise<string> {
    const { data, error } = await this.supabase.client.rpc('create_survey', {
      p_title: input.title,
      p_category: input.category,
      p_options: input.options,
      p_description: input.description ?? null,
      p_deadline: input.deadline ?? null,
    });

    if (error || !data) {
      throw new Error(`Umfrage konnte nicht angelegt werden: ${error?.message}`);
    }
    return data as string;
  }
}
