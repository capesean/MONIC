import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { BreadcrumbService, Breadcrumb } from 'angular-crumbs-2';
import { MenuItem } from 'primeng/api';
import { DOCUMENT } from '@angular/common';
import { environment } from '../environments/environment';

@Component({
    selector: 'main-root',
    templateUrl: './main.component.html'
})
export class MainComponent implements OnInit {

    breadcrumbs: MenuItem[];
    home: MenuItem = { icon: 'pi pi-home', routerLink: ['/'] };;

    constructor(
        private titleService: Title,
        private breadcrumbService: BreadcrumbService,
        @Inject(DOCUMENT) private document: Document
    ) {
        this.breadcrumbService.breadcrumbChanged.subscribe((crumbs) => {
            if (crumbs.length) this.breadcrumbs = crumbs.map(c => this.toPrimeNgMenuItem(c));
            else this.breadcrumbs = [{ label: 'Home', routerLink: ['/'] }];
            this.titleService.setTitle(this.createTitle(crumbs));
        });

    }

    ngOnInit() {
        this.document.body.id = "app";
    }

    private toPrimeNgMenuItem(crumb: Breadcrumb) {
        return <MenuItem>{ label: crumb.displayName, routerLink: [`${crumb.url}`] }
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
