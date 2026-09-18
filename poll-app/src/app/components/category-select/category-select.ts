import {
  Component,
  computed,
  ElementRef,
  HostListener,
  inject,
  model,
  ModelSignal,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';

import { ALL_CATEGORIES, CATEGORIES, CategoryOption } from '../../core/categories';
import { Translate } from '../../core/translate';

/**
 * Custom category dropdown. A native <select> popup cannot be styled
 * consistently across browsers, so this renders its own trigger and list.
 */
@Component({
  selector: 'app-category-select',
  imports: [],
  templateUrl: './category-select.html',
  styleUrl: './category-select.scss',
})
export class CategorySelect {
  protected readonly translate: Translate = inject(Translate);
  private readonly elementRef: ElementRef<HTMLElement> = inject(ElementRef);

  protected readonly categories: readonly CategoryOption[] = CATEGORIES;
  protected readonly allCategories: string = ALL_CATEGORIES;

  readonly value: ModelSignal<string> = model<string>(ALL_CATEGORIES);
  protected readonly open: WritableSignal<boolean> = signal(false);

  protected readonly currentLabelKey: Signal<string> = computed(() =>
    this.labelKeyFor(this.value()),
  );

  /** Opens or closes the option list. */
  protected toggle(): void {
    this.open.update((isOpen) => !isOpen);
  }

  /** Selects one category and closes the list. */
  protected select(category: string): void {
    this.value.set(category);
    this.open.set(false);
  }

  /** Closes the list when a click lands outside this component. */
  @HostListener('document:click', ['$event.target'])
  protected onDocumentClick(target: EventTarget | null): void {
    if (target instanceof Node && !this.elementRef.nativeElement.contains(target)) {
      this.open.set(false);
    }
  }

  @HostListener('keydown.escape')
  protected onEscape(): void {
    this.open.set(false);
  }

  /** Looks up the translation key for the currently selected category. */
  private labelKeyFor(category: string): string {
    const match = this.categories.find((c) => c.value === category);
    return match ? match.labelKey : 'home.sortByCategories';
  }
}
