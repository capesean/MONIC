import { Directive, ElementRef, Input, OnInit, Renderer2, OnDestroy } from '@angular/core';

import { ScrollSpyService } from './scroll-spy.service';

@Directive({
  selector: '[spyTarget]'
})
export class SpyTargetDirective implements OnInit, OnDestroy {

  @Input() spyTarget: string;

  constructor(private el: ElementRef, private spyService: ScrollSpyService, private renderer: Renderer2) { }

  ngOnInit() {
    this.renderer.setAttribute(this.htmlElement, 'id', this.spyTarget);
    this.spyService.addTarget({ name: this.spyTarget, element: this.el });
  }

  private get htmlElement() {
    return this.el.nativeElement;
  }

  ngOnDestroy() {
    this.spyService.removeTarget(this.spyTarget);
  }
}
