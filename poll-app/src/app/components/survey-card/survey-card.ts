import { Component, computed, input, Signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { categoryLabel as categoryLabelFor } from '../../core/categories';
import { daysRemaining, formatDeadlineDate, isClosed } from '../../core/survey-status';
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
  readonly survey = input.required<Survey>();
  readonly variant = input<SurveyCardVariant>('list');

  protected readonly categoryLabel: Signal<string> = computed(() =>
    categoryLabelFor(this.survey().category),
  );
  protected readonly deadlineLabel: Signal<string> = computed(() => this.formatDeadline());

  /** Builds the deadline pill text, distinguishing open, closed and open-ended surveys. */
  private formatDeadline(): string {
    const deadline = this.survey().deadline;
    if (isClosed(this.survey()) && deadline) {
      return `Ended on ${formatDeadlineDate(deadline)}`;
    }
    const days = daysRemaining(this.survey());
    if (days === null) {
      return 'Runs indefinitely';
    }
    return days === 1 ? 'Ends in 1 Day' : `Ends in ${days} Days`;
  }
}
