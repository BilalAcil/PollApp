import {
  Component,
  computed,
  ElementRef,
  HostListener,
  inject,
  input,
  InputSignal,
  model,
  ModelSignal,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';

import { ALL_CATEGORIES, CATEGORIES, CategoryOption } from '../../core/categories';

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
  private readonly elementRef: ElementRef<HTMLElement> = inject(ElementRef);

  protected readonly categories: readonly CategoryOption[] = CATEGORIES;
  protected readonly allCategories: string = ALL_CATEGORIES;

  readonly value: ModelSignal<string> = model<string>(ALL_CATEGORIES);
  readonly showAllOption: InputSignal<boolean> = input<boolean>(true);
  readonly placeholderLabel: InputSignal<string> = input<string>('Sort by categories');
  protected readonly open: WritableSignal<boolean> = signal(false);

  protected readonly currentLabel: Signal<string> = computed(() => this.labelFor(this.value()));
  protected readonly triggerLabel: Signal<string> = computed(() =>
    this.showAllOption() ? this.placeholderLabel() : this.currentLabel(),
  );
  protected readonly selectedLabel: Signal<string | null> = computed(() =>
    this.showAllOption() && this.value() !== this.allCategories ? this.currentLabel() : null,
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

  /** Closes the list when the user presses Escape. */
  @HostListener('keydown.escape')
  protected onEscape(): void {
    this.open.set(false);
  }

  /** Looks up the display label for the currently selected category. */
  private labelFor(category: string): string {
    const match = this.categories.find((c) => c.value === category);
    return match ? match.label : this.placeholderLabel();
  }
}
