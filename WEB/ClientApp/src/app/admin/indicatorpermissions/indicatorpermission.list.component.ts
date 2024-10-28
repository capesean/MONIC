import { Component as NgComponent, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { PagingHeaders } from '../../common/models/http.model';
import { IndicatorPermissionSearchOptions, IndicatorPermissionSearchResponse, IndicatorPermission } from '../../common/models/indicatorpermission.model';
import { FadeThenShrink } from '../../common/animations/fadethenshrink';
import { ErrorService } from '../../common/services/error.service';
import { IndicatorPermissionService } from '../../common/services/indicatorpermission.service';

@NgComponent({
    selector: 'indicatorpermission-list',
    templateUrl: './indicatorpermission.list.component.html',
    animations: [FadeThenShrink]
})
export class IndicatorPermissionListComponent implements OnInit, OnDestroy {

    public indicatorPermissions: IndicatorPermission[] = [];
    public searchOptions = new IndicatorPermissionSearchOptions();
    public showSearchOptions = false;
    public headers = new PagingHeaders();
    private routerSubscription: Subscription;

    constructor(
        public route: ActivatedRoute,
        private router: Router,
        private errorService: ErrorService,
        private indicatorPermissionService: IndicatorPermissionService
    ) {
    }

    ngOnInit(): void {
        this.searchOptions.includeParents = true;
        this.routerSubscription = this.router.events.subscribe(event => {
            if (event instanceof NavigationEnd && !this.route.firstChild) {
                this.runSearch();
            }
        });
        this.runSearch();
    }

    ngOnDestroy(): void {
        this.routerSubscription.unsubscribe();
    }

    runSearch(pageIndex = 0): Subject<IndicatorPermissionSearchResponse> {

        this.searchOptions.pageIndex = pageIndex;

        const subject = new Subject<IndicatorPermissionSearchResponse>();

        this.indicatorPermissionService.search(this.searchOptions)
            .subscribe({
                next: response => {
                    subject.next(response);
                    this.indicatorPermissions = response.indicatorPermissions;
                    this.headers = response.headers;
                },
                error: err => {
                    this.errorService.handleError(err, "Indicator Permissions", "Load");
                }
            });

        return subject;

    }

    goToIndicatorPermission(indicatorPermission: IndicatorPermission): void {
        this.router.navigate([indicatorPermission.indicatorPermissionId], { relativeTo: this.route });
    }
}

