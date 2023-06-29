import { Component as NgComponent, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PagingHeaders } from '../../common/models/http.model';
import { IndicatorSearchOptions, IndicatorSearchResponse, Indicator } from '../../common/models/indicator.model';
import { Enum, Enums } from '../../common/models/enums.model';
import { ErrorService } from '../../common/services/error.service';
import { IndicatorService } from '../../common/services/indicator.service';
import { Category } from '../../common/models/category.model';

@NgComponent({
    selector: 'indicator-list',
    templateUrl: './indicator.list.component.html'
})
export class IndicatorListComponent implements OnInit, OnDestroy {

    public indicators: Indicator[] = [];
    public searchOptions = new IndicatorSearchOptions();
    public headers = new PagingHeaders();
    private routerSubscription: Subscription;
    public indicatorStatuses: Enum[] = Enums.IndicatorStatuses;
    public dateTypes: Enum[] = Enums.DateTypes;
    public indicatorTypes: Enum[] = Enums.IndicatorTypes;
    public category: Category;

    constructor(
        public route: ActivatedRoute,
        private router: Router,
        private errorService: ErrorService,
        private modalService: NgbModal,
        private indicatorService: IndicatorService
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

    runSearch(pageIndex = 0): Subject<IndicatorSearchResponse> {

        this.searchOptions.pageIndex = pageIndex;

        const subject = new Subject<IndicatorSearchResponse>();

        this.indicatorService.search(this.searchOptions)
            .subscribe({
                next: response => {
                    subject.next(response);
                    this.indicators = response.indicators;
                    this.headers = response.headers;
                },
                error: err => {
                    this.errorService.handleError(err, "Indicators", "Load");
                }
            });

        return subject;

    }

    goToIndicator(indicator: Indicator): void {
        this.router.navigate([indicator.indicatorId], { relativeTo: this.route });
    }
}

