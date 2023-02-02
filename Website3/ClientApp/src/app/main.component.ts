import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import { environment } from '../environments/environment';
import { BreadcrumbService } from './common/services/breadcrumb.service';
import { Breadcrumb } from './common/models/breadcrumb.model';

@Component({
    selector: 'main-root',
    templateUrl: './main.component.html'
})
export class MainComponent implements OnInit {

    breadcrumbs: any[];// MenuItem[];
    home: any /*MenuItem*/ = { icon: 'pi pi-home', routerLink: ['/'] };;

    constructor(
        private titleService: Title,
        private breadcrumbService: BreadcrumbService,
        @Inject(DOCUMENT) private document: Document
    ) {
        this.breadcrumbService.breadcrumbChanged.subscribe((crumbs) => {
            debugger;
            //if (crumbs.length) this.breadcrumbs = crumbs.map(c => this.toPrimeNgMenuItem(c));
            //else this.breadcrumbs = [{ label: 'Home', routerLink: ['/'] }];
            //this.titleService.setTitle(this.createTitle(crumbs));
        });

    }

    ngOnInit() {
        this.document.body.id = "app";
    }

    private createTitle(routesCollection: Breadcrumb[]) {
        const title = environment.siteName;
        const titles = routesCollection.filter((route) => route.displayName);

        if (!titles.length) { return title; }

        const routeTitle = this.titlesToString(titles);
        return `${routeTitle} ${title}`;
    }

    private titlesToString(titles: any[]) {
        return titles.reduce((prev, curr) => {
            return `${curr.displayName} - ${prev}`;
        }, '');
    }
}
