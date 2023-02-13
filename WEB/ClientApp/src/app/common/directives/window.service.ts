import { isPlatformBrowser } from '@angular/common';
import { ElementRef, Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { EMPTY, fromEvent, Observable } from 'rxjs';
import { auditTime } from 'rxjs/operators';
import { RESIZE_TIME_THRESHOLD } from './tokens/resize-threshold.token';
import { SCROLL_TIME_THRESHOLD } from './tokens/scroll-threshold.token';


@Injectable({
  providedIn: 'root'
})
export class WindowService {
  private isBrowser = true;
  private scrollEvent$: Observable<Event>;
  private resizeEvent$: Observable<Event>;

  constructor(
    @Inject(PLATFORM_ID) platformId: any,
    @Inject(RESIZE_TIME_THRESHOLD) private resizeTime: number,
    @Inject(SCROLL_TIME_THRESHOLD) private scrollTime: number
  ) {
    if (!isPlatformBrowser(platformId)) {
      this.isBrowser = false;
      this.scrollEvent$ = this.resizeEvent$ = EMPTY;
    } else {
      this.scrollEvent$ = fromEvent(window, 'scroll', { passive: true }).pipe(auditTime(this.scrollTime));
      this.resizeEvent$ = fromEvent(window, 'resize', { passive: true }).pipe(auditTime(this.resizeTime));
    }
  }

  getScrollEventForContainer(scrollContainer: ElementRef) {
    if (!this.isBrowser) {
      return EMPTY;
    }

    return fromEvent(scrollContainer.nativeElement, 'scroll', { passive: true }).pipe(auditTime(this.scrollTime));
  }

  get scrollEvent() {
    return this.scrollEvent$;
  }

  get resizeEvent() {
    return this.resizeEvent$;
  }

  get scrollTop() {
    if (!this.isBrowser) {
      return 0;
    }

    return Math.max(window.pageYOffset, document.documentElement.scrollTop, document.body.scrollTop);
  }

  get viewportHeight() {
    if (!this.isBrowser) {
      return 0;
    }

    return Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
  }

  getElementHeight(el: ElementRef) {
    if (!this.isBrowser) {
      return 0;
    }

    return el.nativeElement.offsetHeight;
  }

  getElementOffsetTop(el: ElementRef) {
    if (!this.isBrowser) {
      return 0;
    }

    return el.nativeElement.offsetTop;
  }

  getElementScrollTop(el: ElementRef) {
    if (!this.isBrowser) {
      return 0;
    }

    return el.nativeElement.scrollTop;
  }
}
