import { Component, OnInit } from '@angular/core';
import { Spinkit } from 'ng-http-loader';
import { Observable } from 'rxjs';
import { AuthStateModel } from './common/models/auth.models';
import { AuthService } from './common/services/auth.service';
import { Title } from '@angular/platform-browser';
import moment from 'moment';
import { environment } from '../environments/environment';
import { BreadcrumbService } from './common/services/breadcrumb.service';
import { NgbModalConfig, NgbTooltipConfig } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    standalone: false
})
export class AppComponent implements OnInit {

    spinkit = Spinkit.skChasingDots;
    authState$: Observable<AuthStateModel>;

    constructor(
        private authService: AuthService,
        private breadcrumbService: BreadcrumbService,
        private titleService: Title,
        private modalConfig: NgbModalConfig,
        tooltipConfig: NgbTooltipConfig
    ) {
        titleService.setTitle(environment.siteName);
        moment.locale("en-gb");
        modalConfig.scrollable = false;
        tooltipConfig.placement = 'top';
        tooltipConfig.openDelay = 750;
    }

    ngOnInit(): void {

        this.authState$ = this.authService.state$;

        this.breadcrumbService.breadcrumbChanged.subscribe((crumbs) => {

            let title = environment.siteName;
            const titles = crumbs.filter(crumb => !!crumb.displayName)
                .reduce((prev, curr) => { return `${curr.displayName} : ${prev}`; }, '') + environment.siteName;
            this.titleService.setTitle(titles ?? title);
        });
    }
}

