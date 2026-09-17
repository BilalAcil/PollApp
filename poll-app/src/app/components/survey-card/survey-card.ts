import { Component, computed, inject, input, Signal } from '@angular/core';

import { CATEGORIES } from '../../core/categories';
import { daysRemaining, isClosed } from '../../core/survey-status';
import { Translate } from '../../core/translate';
import { Survey } from '../../models/survey.model';

export type SurveyCardVariant = 'highlight' | 'list';

/** One survey shown as a card, either as a homescreen highlight or in the list. */
@Component({
  selector: 'app-survey-card',
  imports: [],
  host: {
    '[class.highlight]': "variant() === 'highlight'",
  },
  templateUrl: './survey-card.html',
  styleUrl: './survey-card.scss',
})
export class SurveyCard {
  private readonly translate: Translate = inject(Translate);

  readonly survey = input.required<Survey>();
  readonly variant = input<SurveyCardVariant>('list');

  protected readonly categoryLabel: Signal<string> = computed(() => this.translateCategory());
  protected readonly deadlineLabel: Signal<string> = computed(() => this.formatDeadline());

  /** Translates the survey's category value, falling back to the raw value. */
  private translateCategory(): string {
    const match = CATEGORIES.find((category) => category.value === this.survey().category);
    return match ? this.translate.t(match.labelKey) : this.survey().category;
  }

  /** Builds the deadline pill text, distinguishing open, closed and open-ended surveys. */
  private formatDeadline(): string {
    if (isClosed(this.survey())) {
      return this.translate.t('survey.endedOn', { date: this.formattedDate() });
    }
    const days = daysRemaining(this.survey());
    if (days === null) {
      return this.translate.t('survey.noDeadline');
    }
    const key = days === 1 ? 'survey.endsInDay' : 'survey.endsInDays';
    return this.translate.t(key, { n: days });
  }

  /** Formats the deadline as a locale-aware date string. */
  private formattedDate(): string {
    const deadline = this.survey().deadline;
    if (!deadline) {
      return '';
    }
    const locale = this.translate.lang() === 'de' ? 'de-DE' : 'en-GB';
    return new Date(deadline).toLocaleDateString(locale);
  }
}
