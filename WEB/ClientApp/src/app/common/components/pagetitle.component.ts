import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-page-title',
    templateUrl: './pagetitle.component.html'
})
export class PageTitleComponent {
    
    @Input() title: string;
    @Input() showBreadcrumb = true;

    constructor() { }
}
