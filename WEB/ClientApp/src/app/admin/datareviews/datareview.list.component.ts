import { Component as NgComponent, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { PagingHeaders } from '../../common/models/http.model';
import { DataReviewSearchOptions, DataReviewSearchResponse, DataReview } from '../../common/models/datareview.model';
import { Enum, Enums } from '../../common/models/enums.model';
import { ErrorService } from '../../common/services/error.service';
import { DataReviewService } from '../../common/services/datareview.service';

@NgComponent({
    selector: 'datareview-list',
    templateUrl: './datareview.list.component.html'
})
export class DataReviewListComponent implements OnInit, OnDestroy {

    public dataReviews: DataReview[] = [];
    public searchOptions = new DataReviewSearchOptions();
    public headers = new PagingHeaders();
    private routerSubscription: Subscription;
    public reviewStatuses: Enum[] = Enums.ReviewStatuses;
    public reviewResults: Enum[] = Enums.ReviewResults;

    constructor(
        public route: ActivatedRoute,
        private router: Router,
        private errorService: ErrorService,
        private dataReviewService: DataReviewService
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

    runSearch(pageIndex = 0): Subject<DataReviewSearchResponse> {

        this.searchOptions.pageIndex = pageIndex;

        const subject = new Subject<DataReviewSearchResponse>();

        this.dataReviewService.search(this.searchOptions)
            .subscribe({
                next: response => {
                    subject.next(response);
                    this.dataReviews = response.dataReviews;
                    this.headers = response.headers;
                },
                error: err => {
                    this.errorService.handleError(err, "Data Reviews", "Load");
                }
            });

        return subject;

    }

    goToDataReview(dataReview: DataReview): void {
        this.router.navigate([dataReview.dataReviewId], { relativeTo: this.route });
    }
}

