import { Component, OnInit } from '@angular/core';
import { Spinkit } from 'ng-http-loader';
import { filter, Observable } from 'rxjs';
import { AuthStateModel } from './common/models/auth.models';
import { AuthService } from './common/services/auth.service';
import { Title } from '@angular/platform-browser';
import * as moment from 'moment';
import { environment } from '../environments/environment';
import { NavigationEnd, Router } from '@angular/router';
import { BreadcrumbService } from './common/services/breadcrumb.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {

    spinkit = Spinkit.skChasingDots;
    authState$: Observable<AuthStateModel>;

    constructor(
        private authService: AuthService,
        private router: Router,
        private breadcrumbService: BreadcrumbService,
        private titleService: Title
    ) {
        titleService.setTitle(environment.siteName);
        moment.locale("en-gb");
    }

    ngOnInit(): void {

        this.authState$ = this.authService.state$;

        // start the auth service (so tokens can be automatically refreshed)
        this.authService
            .init()
            .subscribe();

        this.breadcrumbService.breadcrumbChanged.subscribe((crumbs) => {
            console.log('breadcrumb', crumbs)

            let title = environment.siteName;
            const titles = crumbs.filter(crumb => !!crumb.displayName)
                .reduce((prev, curr) => { return `${curr.displayName} : ${prev}`; }, '') + environment.siteName;
            this.titleService.setTitle(titles ?? title)

            //if (!titles.length) return environment.siteName;
            //return titles[titles.length];
            //const routeTitle = this.titlesToString(titles);
            //return `${routeTitle} ${title}`;

            //if (crumbs.length) this.breadcrumbs = crumbs.map(c => this.toPrimeNgMenuItem(c));
            //else this.breadcrumbs = [{ label: 'Home', routerLink: ['/'] }];
            //this.titleService.setTitle(this.createTitle(crumbs));
        });
    }
}

