import {
  Component,
  computed,
  effect,
  inject,
  input,
  InputSignal,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import { ScrollThumb } from '../../components/scroll-thumb/scroll-thumb';
import { categoryLabelKey } from '../../core/categories';
import { SurveyApi } from '../../core/survey-api';
import { formatDeadlineDate, isClosed } from '../../core/survey-status';
import { Translate } from '../../core/translate';
import { OptionResult, QuestionWithOptions, SurveyWithQuestions } from '../../models/survey.model';

const VOTED_KEY_PREFIX = 'pollapp-voted-';

/** Detail view for one survey: voting form on the left, live results on the right. */
@Component({
  selector: 'app-survey-detail',
  imports: [RouterLink, ScrollThumb],
  templateUrl: './survey-detail.html',
  styleUrl: './survey-detail.scss',
})
export class SurveyDetail {
  private readonly surveyApi: SurveyApi = inject(SurveyApi);
  protected readonly translate: Translate = inject(Translate);

  readonly id: InputSignal<string> = input.required<string>();

  protected readonly survey: WritableSignal<SurveyWithQuestions | null> = signal(null);
  protected readonly results: WritableSignal<OptionResult[]> = signal([]);
  protected readonly loading: WritableSignal<boolean> = signal(true);
  protected readonly loadError: WritableSignal<boolean> = signal(false);
  protected readonly voteError: WritableSignal<boolean> = signal(false);
  protected readonly hasVoted: WritableSignal<boolean> = signal(false);
  private readonly selections: WritableSignal<Map<string, Set<string>>> = signal(new Map());

  protected readonly categoryLabel: Signal<string> = computed(() =>
    this.translate.t(categoryLabelKey(this.survey()?.category ?? '')),
  );
  protected readonly deadlineLabel: Signal<string> = computed(() => this.formatDeadlineLabel());
  protected readonly readOnly: Signal<boolean> = computed(() => this.computeReadOnly());
  protected readonly canComplete: Signal<boolean> = computed(() => this.everyQuestionAnswered());
  protected readonly isResultsEmpty: Signal<boolean> = computed(() =>
    this.results().every((option) => option.vote_count === 0),
  );

  constructor() {
    effect((onCleanup) => this.loadAndSubscribe(onCleanup));
  }

  /** Toggles one answer option, replacing the selection for single-answer questions. */
  protected toggleOption(question: QuestionWithOptions, optionId: string): void {
    const next = new Map(this.selections());
    const current = new Set(next.get(question.id));
    if (!question.allow_multiple) {
      current.clear();
      current.add(optionId);
    } else if (current.has(optionId)) {
      current.delete(optionId);
    } else {
      current.add(optionId);
    }
    next.set(question.id, current);
    this.selections.set(next);
  }

  /** Whether one answer option is currently checked in the voting form. */
  protected isOptionSelected(questionId: string, optionId: string): boolean {
    return this.selections().get(questionId)?.has(optionId) ?? false;
  }

  /** Submits every selected option as one vote each and locks the form. */
  protected async complete(): Promise<void> {
    const optionIds = Array.from(this.selections().values()).flatMap((set) => Array.from(set));
    try {
      await this.surveyApi.vote(optionIds);
      this.markVoted(this.id());
      await this.reloadResults(this.id());
    } catch {
      this.voteError.set(true);
    }
  }

  /** Converts a zero-based option index into its display letter (A, B, C, ...). */
  protected optionLetter(index: number): string {
    return String.fromCharCode(65 + index);
  }

  /** Share of votes an option holds among its own question's votes, rounded to a whole percent. */
  protected optionPercent(optionId: string, questionId: string): number {
    const total = this.questionVoteTotal(questionId);
    if (total === 0) {
      return 0;
    }
    return Math.round((this.voteCountFor(optionId) / total) * 100);
  }

  /** Loads the survey and its results for the current id, then keeps results live. */
  private loadAndSubscribe(onCleanup: (fn: () => void) => void): void {
    const surveyId = this.id();
    this.loading.set(true);
    this.loadError.set(false);
    this.voteError.set(false);
    this.hasVoted.set(this.readVotedFlag(surveyId));
    this.selections.set(new Map());
    void this.loadSurveyAndResults(surveyId);
    const unsubscribe = this.surveyApi.subscribeToVotes(() => void this.reloadResults(surveyId));
    onCleanup(unsubscribe);
  }

  /** Fetches the survey and its current results together. */
  private async loadSurveyAndResults(surveyId: string): Promise<void> {
    try {
      const [survey, results] = await Promise.all([
        this.surveyApi.loadSurvey(surveyId),
        this.surveyApi.loadResults(surveyId),
      ]);
      this.survey.set(survey);
      this.results.set(results);
    } catch {
      this.loadError.set(true);
    } finally {
      this.loading.set(false);
    }
  }

  /** Refetches results after a realtime vote event. Failures are ignored: this is a best-effort live update, not the initial load. */
  private async reloadResults(surveyId: string): Promise<void> {
    try {
      this.results.set(await this.surveyApi.loadResults(surveyId));
    } catch {}
  }

  /** A survey is read-only once it has closed or this browser has already voted on it. */
  private computeReadOnly(): boolean {
    const survey = this.survey();
    return this.hasVoted() || (survey !== null && isClosed(survey));
  }

  /** True once every question has at least one selected option. */
  private everyQuestionAnswered(): boolean {
    const survey = this.survey();
    if (!survey) {
      return false;
    }
    return survey.survey_questions.every(
      (question) => (this.selections().get(question.id)?.size ?? 0) > 0,
    );
  }

  /** Total votes cast across all options of one question. */
  private questionVoteTotal(questionId: string): number {
    return this.results()
      .filter((row) => row.question_id === questionId)
      .reduce((sum, row) => sum + row.vote_count, 0);
  }

  /** Current vote count for a single option. */
  private voteCountFor(optionId: string): number {
    return this.results().find((row) => row.option_id === optionId)?.vote_count ?? 0;
  }

  /** Builds the header's deadline text: open with a date, closed, or indefinite. */
  private formatDeadlineLabel(): string {
    const survey = this.survey();
    if (!survey) {
      return '';
    }
    if (!survey.deadline) {
      return this.translate.t('survey.noDeadline');
    }
    const date = formatDeadlineDate(survey.deadline, this.translate.lang());
    const key = isClosed(survey) ? 'survey.endedOn' : 'survey.endsOn';
    return this.translate.t(key, { date });
  }

  /** Reads whether this browser has already voted on the given survey. */
  private readVotedFlag(surveyId: string): boolean {
    return localStorage.getItem(VOTED_KEY_PREFIX + surveyId) === 'true';
  }

  /** Remembers that this browser has voted on the given survey. */
  private markVoted(surveyId: string): void {
    localStorage.setItem(VOTED_KEY_PREFIX + surveyId, 'true');
    this.hasVoted.set(true);
  }
}
