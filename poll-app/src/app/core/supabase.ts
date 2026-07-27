import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

import { environment } from '../../environments/environment';

/**
 * Holds the single Supabase connection shared by the whole application.
 * Components never use this client directly, they go through SurveyApi.
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
