import { Injectable, signal, WritableSignal } from '@angular/core';

import { de } from './i18n/de';
import { en } from './i18n/en';

export type Lang = 'en' | 'de';

const STORAGE_KEY = 'pollapp-lang';
const DICTIONARIES: Record<Lang, Record<string, string>> = { en, de };

/**
 * Looks up one translation key and fills in "{name}" placeholders.
 * Falls back to English, then to the key itself, if nothing matches.
 */
function lookup(lang: Lang, key: string, params?: Record<string, string | number>): string {
  const template = DICTIONARIES[lang][key] ?? en[key] ?? key;
  if (!params) {
    return template;
  }
  return Object.entries(params).reduce(
    (result, [name, value]) => result.replaceAll(`{${name}}`, String(value)),
    template,
  );
}

/**
 * Holds the active UI language as a signal and persists the choice in
 * localStorage, so it survives a reload or a later visit.
 */
@Injectable({
  providedIn: 'root',
})
export class Translate {
  readonly lang: WritableSignal<Lang> = signal(readStoredLang());

  constructor() {
    syncHtmlLang(this.lang());
  }

  /** Switches the active language and remembers the choice for next time. */
  setLang(lang: Lang): void {
    this.lang.set(lang);
    localStorage.setItem(STORAGE_KEY, lang);
    syncHtmlLang(lang);
  }

  /** Translates a key into the currently active language. */
  t(key: string, params?: Record<string, string | number>): string {
    return lookup(this.lang(), key, params);
  }
}

/** Reads the previously chosen language from localStorage, defaulting to English. */
function readStoredLang(): Lang {
  return localStorage.getItem(STORAGE_KEY) === 'de' ? 'de' : 'en';
}

/** Keeps the document's "lang" attribute in sync, since screen readers rely on it. */
function syncHtmlLang(lang: Lang): void {
  document.documentElement.lang = lang;
}
