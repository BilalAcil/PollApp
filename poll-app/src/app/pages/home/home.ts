import { Component, computed, inject, OnInit, Signal, signal, WritableSignal } from '@angular/core';

import { LanguageSwitcher } from '../../components/language-switcher/language-switcher';
import { SurveyCard } from '../../components/survey-card/survey-card';
import { ALL_CATEGORIES, CATEGORIES, CategoryOption } from '../../core/categories';
import { SurveyApi } from '../../core/survey-api';
import { byDeadlineAscending, isClosed, isEndingSoon } from '../../core/survey-status';
import { Translate } from '../../core/translate';
import { Survey } from '../../models/survey.model';

type Tab = 'active' | 'past';

/** The homescreen: hero, ending-soon highlights, and the filterable survey list. */
@Component({
  selector: 'app-home',
  imports: [LanguageSwitcher, SurveyCard],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  private readonly surveyApi: SurveyApi = inject(SurveyApi);
  protected readonly translate: Translate = inject(Translate);

  protected readonly categories: readonly CategoryOption[] = CATEGORIES;
  protected readonly allCategories: string = ALL_CATEGORIES;

  protected readonly surveys: WritableSignal<Survey[]> = signal([]);
  protected readonly loading: WritableSignal<boolean> = signal(true);
  protected readonly loadError: WritableSignal<boolean> = signal(false);
  protected readonly activeTab: WritableSignal<Tab> = signal('active');
  protected readonly categoryFilter: WritableSignal<string> = signal(ALL_CATEGORIES);

  protected readonly endingSoon: Signal<Survey[]> = computed(() =>
    this.surveys()
      .filter((survey) => isEndingSoon(survey))
      .sort(byDeadlineAscending),
  );

  protected readonly visibleSurveys: Signal<Survey[]> = computed(() => this.filterVisible());

  async ngOnInit(): Promise<void> {
    await this.loadSurveys();
  }

  /** Switches between the "active" and "past" tab. */
  protected selectTab(tab: Tab): void {
    this.activeTab.set(tab);
  }

  /** Reads the chosen category out of the native select's change event. */
  protected onCategoryChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.categoryFilter.set(target.value);
  }

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
