import { Component } from '@angular/core';
import { Breadcrumb } from '../models/breadcrumb.model';
import { BreadcrumbService } from '../services/breadcrumb.service';

@Component({
    selector: 'app-breadcrumb',
    templateUrl: './breadcrumb.component.html'
})
export class BreadcrumbComponent {
    breadcrumbs: Breadcrumb[];

    constructor(private breadcrumbService: BreadcrumbService) {
        breadcrumbService.breadcrumbChanged.subscribe((crumbs: Breadcrumb[]) => this.breadcrumbs = crumbs);
    }
}
