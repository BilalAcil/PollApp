import { Component, inject } from '@angular/core';

import { Lang, Translate } from '../../core/translate';

/** Two flag buttons that switch the UI language and persist the choice. */
@Component({
  selector: 'app-language-switcher',
  imports: [],
  templateUrl: './language-switcher.html',
  styleUrl: './language-switcher.scss',
})
export class LanguageSwitcher {
  protected readonly translate: Translate = inject(Translate);

  /** Switches the active UI language. */
  protected select(lang: Lang): void {
    this.translate.setLang(lang);
  }
}
