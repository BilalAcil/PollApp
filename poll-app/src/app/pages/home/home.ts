import { Component, computed, inject, OnInit, Signal, signal, WritableSignal } from '@angular/core';

import { CategorySelect } from '../../components/category-select/category-select';
import { ScrollThumb } from '../../components/scroll-thumb/scroll-thumb';
import { SurveyCard } from '../../components/survey-card/survey-card';
import { ALL_CATEGORIES } from '../../core/categories';
import { CreateSurveyDialogState } from '../../core/create-survey-dialog-state';
import { SurveyApi } from '../../core/survey-api';
import { byDeadlineAscending, isClosed } from '../../core/survey-status';
import { Survey } from '../../models/survey.model';

type Tab = 'active' | 'past';

/** How many of the soonest-ending active surveys are highlighted above the list. */
const ENDING_SOON_COUNT = 3;
/** How long the hero button shows its confirm checkmark before the dialog opens. */
const CONFIRM_ICON_DELAY_MS = 350;
/** Below this width the confirm checkmark is hidden, so the delay is skipped too. */
const CONFIRM_ICON_BREAKPOINT_PX = 900;

/** The homescreen: hero, ending-soon highlights, and the filterable survey list. */
@Component({
  selector: 'app-home',
  imports: [SurveyCard, CategorySelect, ScrollThumb],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  private readonly surveyApi: SurveyApi = inject(SurveyApi);
  protected readonly dialogState: CreateSurveyDialogState = inject(CreateSurveyDialogState);

  protected readonly surveys: WritableSignal<Survey[]> = signal([]);
  protected readonly loading: WritableSignal<boolean> = signal(true);
  protected readonly loadError: WritableSignal<boolean> = signal(false);
  protected readonly activeTab: WritableSignal<Tab> = signal('active');
  protected readonly confirmingCreate: WritableSignal<boolean> = signal(false);
  private readonly activeCategoryFilter: WritableSignal<string> = signal(ALL_CATEGORIES);
  private readonly pastCategoryFilter: WritableSignal<string> = signal(ALL_CATEGORIES);

  /** The category filter for whichever tab is currently selected, kept separate per tab. */
  protected readonly categoryFilter: Signal<string> = computed(() =>
    this.activeTab() === 'active' ? this.activeCategoryFilter() : this.pastCategoryFilter(),
  );

  protected readonly endingSoon: Signal<Survey[]> = computed(() =>
    this.surveys()
      .filter((survey) => !isClosed(survey))
      .sort(byDeadlineAscending)
      .slice(0, ENDING_SOON_COUNT),
  );

  protected readonly visibleSurveys: Signal<Survey[]> = computed(() => this.filterVisible());

  /** Loads the surveys once the component is mounted. */
  async ngOnInit(): Promise<void> {
    await this.loadSurveys();
  }

  /** Switches between the "active" and "past" tab. */
  protected selectTab(tab: Tab): void {
    this.activeTab.set(tab);
  }

  /** Updates the category filter for whichever tab is currently selected. */
  protected setCategoryFilter(category: string): void {
    if (this.activeTab() === 'active') {
      this.activeCategoryFilter.set(category);
    } else {
      this.pastCategoryFilter.set(category);
    }
  }

  /** Shows the hero button's confirm checkmark briefly before opening the dialog. */
  protected startCreateSurvey(): void {
    if (window.innerWidth <= CONFIRM_ICON_BREAKPOINT_PX) {
      this.dialogState.show();
      return;
    }
    this.confirmingCreate.set(true);
    setTimeout(() => {
      this.confirmingCreate.set(false);
      this.dialogState.show();
    }, CONFIRM_ICON_DELAY_MS);
  }

  /** Fetches every survey from the backend, flagging failures for the template. */
  private async loadSurveys(): Promise<void> {
    try {
      this.surveys.set(await this.surveyApi.loadSurveys());
    } catch {
      this.loadError.set(true);
    } finally {
      this.loading.set(false);
    }
  }

  /** Filters the loaded surveys by the active tab and, on top, by category. */
  private filterVisible(): Survey[] {
    const byTab = this.surveys()
      .filter((survey) => (this.activeTab() === 'active' ? !isClosed(survey) : isClosed(survey)))
      .sort(byDeadlineAscending);
    if (this.categoryFilter() === ALL_CATEGORIES) {
      return byTab;
    }
    return byTab.filter((survey) => survey.category === this.categoryFilter());
  }
}
