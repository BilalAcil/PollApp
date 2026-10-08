import {
  Component,
  computed,
  effect,
  HostListener,
  inject,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { Router } from '@angular/router';

import { CategorySelect } from '../category-select/category-select';
import { CreateSurveyDialogState } from '../../core/create-survey-dialog-state';
import { optionLetter } from '../../core/option-letter';
import { SurveyApi } from '../../core/survey-api';
import { Translate } from '../../core/translate';
import { NewSurvey, NewSurveyQuestion } from '../../models/survey.model';

/** Minimum answer options once "allow multiple" is checked. */
const MIN_ANSWERS_MULTI = 2;
/** Minimum answer options for a single-answer question: just A. */
const MIN_ANSWERS_SINGLE = 1;
/** Maximum answer options a question may have. */
const MAX_ANSWERS = 6;

/** One question as edited in the form, before being sent to the backend. */
interface DraftQuestion {
  id: string;
  text: string;
  options: string[];
  allowMultiple: boolean;
}

/** The survey fields as edited in the form, before being sent to the backend. */
interface SurveyDraft {
  title: string;
  description: string;
  deadline: string;
  questions: DraftQuestion[];
}

/** Builds a single empty question, optionally reusing an existing id. */
function createEmptyQuestion(id: string = crypto.randomUUID()): DraftQuestion {
  return { id, text: '', options: [''], allowMultiple: false };
}

/** The minimum number of answer options a question must keep right now. */
function minAnswersFor(question: DraftQuestion): number {
  return question.allowMultiple ? MIN_ANSWERS_MULTI : MIN_ANSWERS_SINGLE;
}

/** Drops empty answer options beyond the first, so they don't resurface later. */
function trimEmptyOptions(options: string[]): string[] {
  return options.filter((option, index) => index === 0 || option.trim().length > 0);
}

/** Builds a fresh, empty survey draft with one starter question. */
function createEmptyDraft(): SurveyDraft {
  return { title: '', description: '', deadline: '', questions: [createEmptyQuestion()] };
}

/** Converts a date-input value (YYYY-MM-DD) into an end-of-day ISO timestamp. */
function toIsoDeadline(value: string): string {
  return new Date(`${value}T23:59:59`).toISOString();
}

/** Strips the local draft id and trims text for one question. */
function toNewSurveyQuestion(question: DraftQuestion): NewSurveyQuestion {
  return {
    text: question.text.trim(),
    options: question.options.map((option) => option.trim()).filter((option) => option.length > 0),
    allow_multiple: question.allowMultiple,
  };
}

/**
 * Overlay form for creating a new survey. Mounted once at the app root and
 * shown or hidden through `CreateSurveyDialogState`, since it can be opened
 * from more than one page.
 */
@Component({
  selector: 'app-create-survey-dialog',
  imports: [CategorySelect],
  templateUrl: './create-survey-dialog.html',
  styleUrl: './create-survey-dialog.scss',
})
export class CreateSurveyDialog {
  private readonly surveyApi: SurveyApi = inject(SurveyApi);
  private readonly router: Router = inject(Router);
  protected readonly dialogState: CreateSurveyDialogState = inject(CreateSurveyDialogState);
  protected readonly translate: Translate = inject(Translate);

  protected readonly draft: WritableSignal<SurveyDraft> = signal(createEmptyDraft());
  protected readonly category: WritableSignal<string> = signal('');
  protected readonly submitting: WritableSignal<boolean> = signal(false);
  protected readonly submitError: WritableSignal<boolean> = signal(false);
  protected readonly createdSurveyId: WritableSignal<string | null> = signal(null);
  protected readonly optionLetter: (index: number) => string = optionLetter;
  protected readonly maxAnswers: number = MAX_ANSWERS;

  protected readonly canPublish: Signal<boolean> = computed(() => this.validateDraft());

  constructor() {
    effect((onCleanup) => this.lockBodyScroll(onCleanup));
  }

  /** Updates the survey title. */
  protected updateTitle(value: string): void {
    this.draft.update((d) => ({ ...d, title: value }));
  }

  /** Updates the optional description text. */
  protected updateDescription(value: string): void {
    this.draft.update((d) => ({ ...d, description: value }));
  }

  /** Updates the optional end date. */
  protected updateDeadline(value: string): void {
    this.draft.update((d) => ({ ...d, deadline: value }));
  }

  /** Clears the title field. */
  protected clearTitle(): void {
    this.updateTitle('');
  }

  /** Clears the end date field. */
  protected clearDeadline(): void {
    this.updateDeadline('');
  }

  /** Clears the description field. */
  protected clearDescription(): void {
    this.updateDescription('');
  }

  /** Appends a new, empty question. */
  protected addQuestion(): void {
    this.draft.update((d) => ({ ...d, questions: [...d.questions, createEmptyQuestion()] }));
  }

  /** Removes one question block entirely. */
  protected removeQuestion(questionId: string): void {
    this.draft.update((d) => ({
      ...d,
      questions: d.questions.filter((q) => q.id !== questionId),
    }));
  }

  /** Resets the first question's text and answers instead of removing it. */
  protected clearFirstQuestion(): void {
    this.draft.update((d) => ({
      ...d,
      questions: [createEmptyQuestion(d.questions[0]?.id), ...d.questions.slice(1)],
    }));
  }

  /** Clears question 1 in place, removes every other question block entirely. */
  protected onDeleteQuestion(index: number, questionId: string): void {
    if (index === 0) {
      this.clearFirstQuestion();
    } else {
      this.removeQuestion(questionId);
    }
  }

  /** Updates one question's text. */
  protected updateQuestionText(questionId: string, text: string): void {
    this.updateQuestion(questionId, (q) => ({ ...q, text }));
  }

  /** Toggles multi-answer mode, revealing option B the first time it's checked. */
  protected toggleAllowMultiple(questionId: string): void {
    this.updateQuestion(questionId, (q) => {
      const allowMultiple = !q.allowMultiple;
      if (!allowMultiple) {
        return { ...q, allowMultiple, options: trimEmptyOptions(q.options) };
      }
      const needsOption = q.options.length < MIN_ANSWERS_MULTI;
      return { ...q, allowMultiple, options: needsOption ? [...q.options, ''] : q.options };
    });
  }

  /** Appends an empty answer option, up to the maximum. */
  protected addAnswer(questionId: string): void {
    this.updateQuestion(questionId, (q) =>
      q.options.length >= MAX_ANSWERS ? q : { ...q, options: [...q.options, ''] },
    );
  }

  /** Removes one answer option, down to a single one. Dropping below two un-checks "allow multiple". */
  protected removeAnswer(questionId: string, index: number): void {
    this.updateQuestion(questionId, (q) => {
      if (q.options.length <= MIN_ANSWERS_SINGLE) {
        return q;
      }
      const options = q.options.filter((_, i) => i !== index);
      const allowMultiple = options.length >= MIN_ANSWERS_MULTI && q.allowMultiple;
      return { ...q, options, allowMultiple };
    });
  }

  /** Updates the text of one answer option. */
  protected updateAnswer(questionId: string, index: number, value: string): void {
    this.updateQuestion(questionId, (q) => ({
      ...q,
      options: q.options.map((option, i) => (i === index ? value : option)),
    }));
  }

  /** Closes the dialog unless a publish request is in flight. */
  protected requestClose(): void {
    if (!this.submitting()) {
      this.dialogState.hide();
    }
  }

  /** Closes the dialog on Escape, same pattern as CategorySelect. */
  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    this.requestClose();
  }

  /** Sends the draft to the backend and switches to the confirmation view. */
  protected async publish(): Promise<void> {
    if (!this.canPublish() || this.submitting()) {
      return;
    }
    this.submitting.set(true);
    this.submitError.set(false);
    try {
      this.createdSurveyId.set(await this.surveyApi.createSurvey(this.toNewSurvey()));
    } catch {
      this.submitError.set(true);
    } finally {
      this.submitting.set(false);
    }
  }

  /** Navigates to the newly created survey and closes the dialog. */
  protected goToNewSurvey(id: string): void {
    void this.router.navigate(['/surveys', id]);
    this.dialogState.hide();
  }

  /** Applies an updater function to a single question by id. */
  private updateQuestion(questionId: string, updater: (q: DraftQuestion) => DraftQuestion): void {
    this.draft.update((d) => ({
      ...d,
      questions: d.questions.map((q) => (q.id === questionId ? updater(q) : q)),
    }));
  }

  /** True once the title, category and every question satisfy the form's rules. */
  private validateDraft(): boolean {
    const d = this.draft();
    return (
      d.title.trim().length > 0 &&
      this.category().length > 0 &&
      d.questions.every((q) => this.questionIsValid(q))
    );
  }

  /** True once a question has text and enough non-empty answers for its mode. */
  private questionIsValid(question: DraftQuestion): boolean {
    const filled = question.options.filter((option) => option.trim().length > 0);
    return question.text.trim().length > 0 && filled.length >= minAnswersFor(question);
  }

  /** Maps the editable draft onto the shape the backend expects. */
  private toNewSurvey(): NewSurvey {
    const d = this.draft();
    return {
      title: d.title.trim(),
      category: this.category(),
      description: d.description.trim() || null,
      deadline: d.deadline ? toIsoDeadline(d.deadline) : null,
      questions: d.questions.map(toNewSurveyQuestion),
    };
  }

  /** Locks page scrolling while the overlay is open, restored on destroy. */
  private lockBodyScroll(onCleanup: (fn: () => void) => void): void {
    document.body.style.overflow = 'hidden';
    onCleanup(() => {
      document.body.style.overflow = '';
    });
  }
}
