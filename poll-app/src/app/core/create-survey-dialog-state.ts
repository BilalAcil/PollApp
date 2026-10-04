import { Injectable, signal, WritableSignal } from '@angular/core';

/**
 * Shared visibility state for the "New survey" overlay, since it can be
 * opened from more than one page (Home, Survey Detail) and must stay a
 * single instance mounted once at the application root.
 */
@Injectable({
  providedIn: 'root',
})
export class CreateSurveyDialogState {
  readonly open: WritableSignal<boolean> = signal(false);

  /** Opens the dialog. */
  show(): void {
    this.open.set(true);
  }

  /** Closes the dialog. */
  hide(): void {
    this.open.set(false);
  }
}
