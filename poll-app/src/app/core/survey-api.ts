import { inject, Injectable } from '@angular/core';

import { NewSurvey, OptionResult, Survey } from '../models/survey.model';
import { Supabase } from './supabase';

/**
 * Alle Datenbank-Zugriffe der App an einer Stelle.
 * Jede Methode wirft im Fehlerfall, damit die Komponente den Fehler anzeigen kann.
 */
@Injectable({
  providedIn: 'root',
})
export class SurveyApi {
  private readonly supabase = inject(Supabase);

  /** Alle Umfragen, frühestes Enddatum zuerst (User Story 1). */
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

  /** Eine einzelne Umfrage für die Detailansicht. */
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

  /** Antwortoptionen samt Stimmenzahl aus der View "option_results". */
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

  /** Legt eine Stimme an. Gezählt wird beim nächsten Laden der Auswertung. */
  async vote(optionId: string): Promise<void> {
    const { error } = await this.supabase.client
      .from('votes')
      .insert({ option_id: optionId });

    if (error) {
      throw new Error(`Stimme konnte nicht gespeichert werden: ${error.message}`);
    }
  }

  /**
   * Legt Umfrage und Antwortoptionen an und gibt die neue Umfrage-Id zurück.
   * Ruft die Datenbankfunktion "create_survey" auf, damit beides in einer
   * Transaktion passiert: Geht ein Schritt schief, entsteht keine halbe Umfrage.
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
