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
import { Router, RouterLink } from '@angular/router';

import { ScrollThumb } from '../../components/scroll-thumb/scroll-thumb';
import { categoryLabel as categoryLabelFor } from '../../core/categories';
import { CreateSurveyDialogState } from '../../core/create-survey-dialog-state';
import { optionLetter } from '../../core/option-letter';
import { SurveyApi } from '../../core/survey-api';
import { formatDeadlineDate, isClosed } from '../../core/survey-status';
import { OptionResult, QuestionWithOptions, SurveyWithQuestions } from '../../models/survey.model';

const VOTED_KEY_PREFIX = 'pollapp-voted-';
/** Multiplier to turn a vote share into a whole percent. */
const PERCENT_MULTIPLIER = 100;
/** How long the real results are shown after voting, before returning to the homescreen. */
const RESULTS_PREVIEW_DELAY_MS = 2000;

/** Detail view for one survey: voting form on the left, live results on the right. */
@Component({
  selector: 'app-survey-detail',
  imports: [ScrollThumb, RouterLink],
  templateUrl: './survey-detail.html',
  styleUrl: './survey-detail.scss',
})
export class SurveyDetail {
  private readonly surveyApi: SurveyApi = inject(SurveyApi);
  private readonly router: Router = inject(Router);
  protected readonly dialogState: CreateSurveyDialogState = inject(CreateSurveyDialogState);

  readonly id: InputSignal<string> = input.required<string>();

  protected readonly survey: WritableSignal<SurveyWithQuestions | null> = signal(null);
  protected readonly results: WritableSignal<OptionResult[]> = signal([]);
  protected readonly loading: WritableSignal<boolean> = signal(true);
  protected readonly loadError: WritableSignal<boolean> = signal(false);
  protected readonly voteError: WritableSignal<boolean> = signal(false);
  protected readonly hasVoted: WritableSignal<boolean> = signal(false);
  protected readonly resultsScrolled: WritableSignal<boolean> = signal(false);
  protected readonly optionLetter: (index: number) => string = optionLetter;
  private readonly selections: WritableSignal<Map<string, Set<string>>> = signal(new Map());

  protected readonly categoryLabel: Signal<string> = computed(() =>
    categoryLabelFor(this.survey()?.category ?? ''),
  );
  protected readonly deadlineLabel: Signal<string> = computed(() => this.formatDeadlineLabel());
  protected readonly readOnly: Signal<boolean> = computed(() => this.computeReadOnly());
  protected readonly canComplete: Signal<boolean> = computed(() => this.everyQuestionAnswered());
  /** True while the user can still vote: shows a local preview instead of the server results. */
  protected readonly previewMode: Signal<boolean> = computed(() => !this.readOnly());
  protected readonly isResultsEmpty: Signal<boolean> = computed(() => this.computeResultsEmpty());
  protected readonly resultsOpen: WritableSignal<boolean> = signal(true);
  protected readonly readOnlyHint: WritableSignal<boolean> = signal(false);
  protected readonly readOnlyHintMessage: Signal<string> = computed(() =>
    this.hasVoted() ? "You've already answered this survey." : 'Voting is closed for this survey.',
  );

  constructor() {
    effect((onCleanup) => this.loadAndSubscribe(onCleanup));
  }

  /** Shows a hint, once, when the user clicks an answer that can no longer be voted on. */
  protected onReadOnlyClick(): void {
    if (this.readOnly()) {
      this.readOnlyHint.set(true);
    }
  }

  /** Toggles one answer option, replacing the selection for single-answer questions. */
  protected toggleOption(question: QuestionWithOptions, optionId: string): void {
    const next = new Map(this.selections());
    const current = new Set(next.get(question.id));
    next.set(question.id, this.nextSelection(current, optionId, question.allow_multiple));
    this.selections.set(next);
  }

  /** Computes the next selected-option set for a question after toggling one option. */
  private nextSelection(
    current: Set<string>,
    optionId: string,
    allowMultiple: boolean,
  ): Set<string> {
    if (!allowMultiple) {
      return current.has(optionId) ? new Set() : new Set([optionId]);
    }
    const next = new Set(current);
    if (next.has(optionId)) {
      next.delete(optionId);
    } else {
      next.add(optionId);
    }
    return next;
  }

  /** Whether one answer option is currently checked in the voting form. */
  protected isOptionSelected(questionId: string, optionId: string): boolean {
    return this.selections().get(questionId)?.has(optionId) ?? false;
  }

  /** Submits every selected option as one vote each, then returns to the homescreen after briefly showing the live results. */
  protected async complete(): Promise<void> {
    const optionIds = Array.from(this.selections().values()).flatMap((set) => Array.from(set));
    try {
      await this.surveyApi.vote(optionIds);
      this.markVoted(this.id());
      await this.reloadResults(this.id());
      setTimeout(() => void this.router.navigate(['/']), RESULTS_PREVIEW_DELAY_MS);
    } catch {
      this.voteError.set(true);
    }
  }

  /** Toggles whether the results panel is expanded below the 1000px breakpoint. */
  protected toggleResults(): void {
    this.resultsOpen.update((open) => !open);
  }

  /** Tracks whether the results list has been scrolled away from its top. */
  protected onResultsScroll(event: Event): void {
    const viewport = event.target as HTMLElement;
    this.resultsScrolled.set(viewport.scrollTop > 0);
  }

  /** The percent to render for one option: a local preview while voting, the real share once cast. */
  protected displayPercent(optionId: string, questionId: string): number {
    return this.previewMode()
      ? this.previewPercent(optionId, questionId)
      : this.optionPercent(optionId, questionId);
  }

  /** Share of votes an option holds among its own question's votes, rounded to a whole percent. */
  private optionPercent(optionId: string, questionId: string): number {
    const total = this.questionVoteTotal(questionId);
    if (total === 0) {
      return 0;
    }
    return Math.round((this.voteCountFor(optionId) / total) * PERCENT_MULTIPLIER);
  }

  /** Previews an option's share based only on the user's own in-progress selection. */
  private previewPercent(optionId: string, questionId: string): number {
    const selected = this.selections().get(questionId);
    if (!selected || selected.size === 0 || !selected.has(optionId)) {
      return 0;
    }
    return Math.round(PERCENT_MULTIPLIER / selected.size);
  }

  /** True once there is nothing to show: no own selection yet while voting, no votes yet once cast. */
  private computeResultsEmpty(): boolean {
    if (this.previewMode()) {
      return Array.from(this.selections().values()).every((set) => set.size === 0);
    }
    return this.results().every((option) => option.vote_count === 0);
  }

  /** Loads the survey and its results for the current id, then keeps results live. */
  private loadAndSubscribe(onCleanup: (fn: () => void) => void): void {
    const surveyId = this.id();
    this.loading.set(true);
    this.loadError.set(false);
    this.voteError.set(false);
    this.hasVoted.set(this.readVotedFlag(surveyId));
    this.readOnlyHint.set(false);
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
      return 'Runs indefinitely';
    }
    const date = formatDeadlineDate(survey.deadline);
    return isClosed(survey) ? `Ended on ${date}` : `Ends on ${date}`;
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
