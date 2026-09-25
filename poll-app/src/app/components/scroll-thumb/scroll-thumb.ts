import {
  Component,
  computed,
  HostListener,
  effect,
  input,
  InputSignal,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';

/** Fixed pixel height of the thumb, per the design spec. */
const THUMB_HEIGHT_PX = 64;

/**
 * Custom vertical scrollbar thumb for a given viewport element.
 *
 * Native scrollbar up/down buttons cannot be removed consistently across
 * browsers (Firefox ignores `::-webkit-scrollbar-button`), so this replaces
 * the native scrollbar with a plain draggable thumb instead.
 */
@Component({
  selector: 'app-scroll-thumb',
  imports: [],
  templateUrl: './scroll-thumb.html',
  styleUrl: './scroll-thumb.scss',
})
export class ScrollThumb {
  readonly viewport: InputSignal<HTMLElement | null> = input<HTMLElement | null>(null);

  private readonly scrollTop: WritableSignal<number> = signal(0);
  private readonly clientHeight: WritableSignal<number> = signal(0);
  private readonly scrollHeight: WritableSignal<number> = signal(0);
  protected readonly dragging: WritableSignal<boolean> = signal(false);
  private dragStartY = 0;
  private dragStartScrollTop = 0;

  protected readonly visible: Signal<boolean> = computed(
    () => this.scrollHeight() > this.clientHeight(),
  );

  protected readonly thumbHeight: Signal<number> = computed(() => this.computeThumbHeight());
  protected readonly thumbTop: Signal<number> = computed(() => this.computeThumbTop());

  constructor() {
    effect((onCleanup) => this.attachToViewport(onCleanup));
  }

  /** Starts a drag gesture on the thumb. */
  protected onThumbPointerDown(event: PointerEvent): void {
    this.dragging.set(true);
    this.dragStartY = event.clientY;
    this.dragStartScrollTop = this.viewport()?.scrollTop ?? 0;
    event.preventDefault();
  }

  /** Continues an active drag gesture as the pointer moves. */
  @HostListener('document:pointermove', ['$event'])
  protected onDocumentPointerMove(event: PointerEvent): void {
    if (this.dragging()) {
      this.dragThumbTo(event.clientY);
    }
  }

  /** Ends the drag gesture once the pointer is released. */
  @HostListener('document:pointerup')
  protected onDocumentPointerUp(): void {
    this.dragging.set(false);
  }

  /** Subscribes to scroll and resize changes on the current viewport element. */
  private attachToViewport(onCleanup: (fn: () => void) => void): void {
    const el = this.viewport();
    if (!el) {
      return;
    }
    this.readMetrics(el);
    const onScroll = (): void => this.readMetrics(el);
    el.addEventListener('scroll', onScroll);
    const observer = new ResizeObserver(() => this.readMetrics(el));
    observer.observe(el);
    onCleanup(() => {
      el.removeEventListener('scroll', onScroll);
      observer.disconnect();
    });
  }

  /** Reads the viewport's current scroll metrics into signals. */
  private readMetrics(el: HTMLElement): void {
    this.scrollTop.set(el.scrollTop);
    this.clientHeight.set(el.clientHeight);
    this.scrollHeight.set(el.scrollHeight);
  }

  /** The thumb's fixed pixel height, capped by the track's own height. */
  private computeThumbHeight(): number {
    return Math.min(THUMB_HEIGHT_PX, this.clientHeight());
  }

  /** Computes the thumb's pixel offset from the top of the track. */
  private computeThumbTop(): number {
    const track = this.clientHeight();
    const maxScroll = this.scrollHeight() - track;
    if (maxScroll <= 0) {
      return 0;
    }
    const travel = track - this.thumbHeight();
    return (this.scrollTop() / maxScroll) * travel;
  }

  /** Moves the viewport's scroll position to follow a drag to clientY. */
  private dragThumbTo(clientY: number): void {
    const el = this.viewport();
    const track = this.clientHeight();
    const travel = track - this.thumbHeight();
    if (!el || travel <= 0) {
      return;
    }
    const deltaScroll = ((clientY - this.dragStartY) / travel) * (this.scrollHeight() - track);
    el.scrollTop = this.dragStartScrollTop + deltaScroll;
  }
}
