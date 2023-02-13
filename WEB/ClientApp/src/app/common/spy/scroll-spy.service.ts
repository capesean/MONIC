import { ElementRef, Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SpyTarget } from './spy-target.model';
import { WindowService } from './window.service';

@Injectable({
  providedIn: 'root'
})
export class ScrollSpyService {
  private stopSpying$ = new Subject();
  private activeSpyTarget$ = new Subject<string>();
  private scrollEvent: Observable<Event>;
  private resizeEvent: Observable<Event>;
  private spyTargets: SpyTarget[] = [];
  private thresholdTop = 0;
  private thresholdBottom = 0;
  private scrollContainer: ElementRef;
  private isSpying = false;

  constructor(private windowService: WindowService) {
    this.scrollEvent = this.windowService.scrollEvent.pipe(takeUntil(this.stopSpying$));
    this.resizeEvent = this.windowService.resizeEvent.pipe(takeUntil(this.stopSpying$));
  }

  spy({ scrollContainer, thresholdTop = 0, thresholdBottom = 0 }: SpyOptions = {}) {
    // this is to prevent duplicate listeners
    if (this.isSpying) {
      return;
    }

    this.isSpying = true;
    this.scrollContainer = scrollContainer;
    this.thresholdTop = thresholdTop;
    this.thresholdBottom = thresholdBottom;

    this.scrollEvent.subscribe(() => this.checkActiveElement(scrollContainer));
    this.resizeEvent.subscribe(() => this.checkActiveElement(scrollContainer));

    if (scrollContainer != null) {
      this.windowService.getScrollEventForContainer(scrollContainer)
        .pipe(takeUntil(this.stopSpying$))
        .subscribe(() => this.checkActiveElement(scrollContainer));
    }

    this.checkActiveElement(scrollContainer);
  }

  addTarget(target: SpyTarget) {
    this.spyTargets.push({ ...target });
    this.checkActiveElement(this.scrollContainer);
  }

  removeTarget(target: string) {
    this.spyTargets = this.spyTargets.filter(spyTarget => target !== spyTarget.name);
    this.checkActiveElement(this.scrollContainer);
  }

  checkActiveElement(scrollContainer?: ElementRef) {
    let activeTarget: SpyTarget = null;

    for (const target of this.spyTargets) {
      const activeElement = activeTarget != null ? activeTarget.element : null;
      if (this.isElementActive(target.element, scrollContainer, activeElement)) {
        activeTarget = target;
      }
    }

    this.activeSpyTarget$.next(activeTarget ? activeTarget.name : null);
  }

  isElementActive(element: ElementRef, scrollContainer?: ElementRef, currentActiveElement?: ElementRef) {
    const targetOffsetTop = this.windowService.getElementOffsetTop(element);
    const targetHeight = this.windowService.getElementHeight(element);

    if (currentActiveElement != null && this.windowService.getElementOffsetTop(currentActiveElement) > targetOffsetTop) {
      return false;
    }

    const hasContainer = (scrollContainer != null);

    const isInsideWindow = this.isElementInsideWindow(hasContainer, targetHeight, targetOffsetTop);

    if (isInsideWindow && !hasContainer) {
      return true;
    }

    return isInsideWindow && hasContainer && this.isElementInsiedScrollContainer(scrollContainer, targetHeight, targetOffsetTop);
  }

  private isElementInsideWindow(hasContainer: boolean, elementHeight: number, elementOffsetTop: number) {
    const scrollTop = this.windowService.scrollTop;
    const viewportHeight = this.windowService.viewportHeight;

    // target bottom edge is below window top edge && target top edge is above window bottom edge
    // if target has a container, don't check for thresholds on the window
    if (hasContainer) {
      return elementOffsetTop + elementHeight > scrollTop
      && elementOffsetTop < scrollTop + viewportHeight;
    }

    return elementOffsetTop + elementHeight > scrollTop + this.thresholdTop
    && elementOffsetTop < scrollTop + viewportHeight - this.thresholdBottom;
  }

  private isElementInsiedScrollContainer(container: ElementRef, elementHeight: number, elementOffsetTop: number) {
    const scrollContainerScrollTop = this.windowService.getElementScrollTop(container);
    const scrollContainerHeight = this.windowService.getElementHeight(container);
    const elementOffsetTopFromParent = elementOffsetTop - this.windowService.getElementOffsetTop(container);

    // element bottom edge is below container top edge && element top edge is above container bottom edge
    return elementOffsetTopFromParent + elementHeight > scrollContainerScrollTop + this.thresholdTop
      && elementOffsetTopFromParent < scrollContainerScrollTop + scrollContainerHeight - this.thresholdBottom;
  }

  get activeSpyTarget() {
    return this.activeSpyTarget$.asObservable();
  }

  stopSpying() {
    this.stopSpying$.next(undefined);
    this.spyTargets = [];
    this.isSpying = false;
  }
}

interface SpyOptions {
  scrollContainer?: ElementRef;
  thresholdTop?: number;
  thresholdBottom?: number;
}
