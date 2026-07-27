import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

import { environment } from '../../environments/environment';

/**
 * Hält die eine Supabase-Verbindung, die die ganze App benutzt.
 * Alle Datenzugriffe laufen über SurveyApi, nicht direkt über diesen Service.
 */
@Injectable({
  providedIn: 'root',
})
export class Supabase {
  readonly client: SupabaseClient = createClient(
    environment.supabaseUrl,
    environment.supabaseKey,
  );
}
