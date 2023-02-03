import { Component, OnInit } from '@angular/core';
import { Spinkit } from 'ng-http-loader';
import { Observable } from 'rxjs';
import { AuthStateModel } from './common/models/auth.models';
import { AuthService } from './common/services/auth.service';
import { Title } from '@angular/platform-browser';
import * as moment from 'moment';
import { environment } from '../environments/environment';
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

            let title = environment.siteName;
            const titles = crumbs.filter(crumb => !!crumb.displayName)
                .reduce((prev, curr) => { return `${curr.displayName} : ${prev}`; }, '') + environment.siteName;
            this.titleService.setTitle(titles ?? title);

        });
    }
}

