import { Component, computed, inject, input, Signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { categoryLabelKey } from '../../core/categories';
import { daysRemaining, formatDeadlineDate, isClosed } from '../../core/survey-status';
import { Translate } from '../../core/translate';
import { Survey } from '../../models/survey.model';

export type SurveyCardVariant = 'highlight' | 'list';

/** One survey shown as a card, either as a homescreen highlight or in the list. */
@Component({
  selector: 'app-survey-card',
  imports: [RouterLink],
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
    return this.translate.t(categoryLabelKey(this.survey().category));
  }

  /** Builds the deadline pill text, distinguishing open, closed and open-ended surveys. */
  private formatDeadline(): string {
    const deadline = this.survey().deadline;
    if (isClosed(this.survey()) && deadline) {
      return this.translate.t('survey.endedOn', {
        date: formatDeadlineDate(deadline, this.translate.lang()),
      });
    }
    const days = daysRemaining(this.survey());
    if (days === null) {
      return this.translate.t('survey.noDeadline');
    }
    const key = days === 1 ? 'survey.endsInDay' : 'survey.endsInDays';
    return this.translate.t(key, { n: days });
  }
}
