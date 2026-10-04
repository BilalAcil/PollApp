import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { CreateSurveyDialog } from './components/create-survey-dialog/create-survey-dialog';
import { CreateSurveyDialogState } from './core/create-survey-dialog-state';

/**
 * Application shell. Every page renders through the router outlet below.
 * The create-survey overlay is mounted here too, since it can be opened
 * from more than one page and must stay a single shared instance.
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CreateSurveyDialog],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly dialogState: CreateSurveyDialogState = inject(CreateSurveyDialogState);
}
