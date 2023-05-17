import { Component as NgComponent, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { PagingHeaders } from '../../common/models/http.model';
import { DatumSearchOptions, DatumSearchResponse, Datum } from '../../common/models/datum.model';
import { ErrorService } from '../../common/services/error.service';
import { DatumService } from '../../common/services/datum.service';
import { environment } from '../../../environments/environment';

@NgComponent({
    selector: 'datum-list',
    templateUrl: './datum.list.component.html'
})
export class DatumListComponent implements OnInit, OnDestroy {

    public data: Datum[] = [];
    public searchOptions = new DatumSearchOptions();
    public headers = new PagingHeaders();
    private routerSubscription: Subscription;
    protected environment = environment;

    constructor(
        public route: ActivatedRoute,
        private router: Router,
        private errorService: ErrorService,
        private datumService: DatumService
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

    runSearch(pageIndex = 0): Subject<DatumSearchResponse> {

        this.searchOptions.pageIndex = pageIndex;

        const subject = new Subject<DatumSearchResponse>();

        this.datumService.search(this.searchOptions)
            .subscribe({
                next: response => {
                    subject.next(response);
                    this.data = response.data;
                    this.headers = response.headers;
                },
                error: err => {
                    this.errorService.handleError(err, "Data", "Load");
                }
            });

        return subject;

    }

    goToDatum(datum: Datum): void {
        this.router.navigate([datum.indicatorId, datum.entityId, datum.dateId], { relativeTo: this.route });
    }
}

