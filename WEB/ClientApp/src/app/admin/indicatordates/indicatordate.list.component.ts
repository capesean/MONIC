import { Component as NgComponent, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { PagingHeaders } from '../../common/models/http.model';
import { IndicatorDateSearchOptions, IndicatorDateSearchResponse, IndicatorDate } from '../../common/models/indicatordate.model';
import { FadeThenShrink } from '../../common/animations/fadethenshrink';
import { ErrorService } from '../../common/services/error.service';
import { IndicatorDateService } from '../../common/services/indicatordate.service';

@NgComponent({
    selector: 'indicatordate-list',
    templateUrl: './indicatordate.list.component.html',
    animations: [FadeThenShrink],
    standalone: false
})
export class IndicatorDateListComponent implements OnInit {

    public indicatorDates: IndicatorDate[] = [];
    public searchOptions = new IndicatorDateSearchOptions();
    public showSearchOptions = false;
    public headers = new PagingHeaders();

    constructor(
        public route: ActivatedRoute,
        private router: Router,
        private errorService: ErrorService,
        private indicatorDateService: IndicatorDateService
    ) {
    }

    ngOnInit(): void {
        this.searchOptions.includeParents = true;
        this.runSearch();
    }

    runSearch(pageIndex = 0): Subject<IndicatorDateSearchResponse> {

        this.searchOptions.pageIndex = pageIndex;

        const subject = new Subject<IndicatorDateSearchResponse>();

        this.indicatorDateService.search(this.searchOptions)
            .subscribe({
                next: response => {
                    subject.next(response);
                    this.indicatorDates = response.indicatorDates;
                    this.headers = response.headers;
                },
                error: err => {
                    this.errorService.handleError(err, "Indicator Dates", "Load");
                }
            });

        return subject;

    }

    goToIndicatorDate(indicatorDate: IndicatorDate): void {
        this.router.navigate(["/indicators", indicatorDate.indicator.indicatorId, "indicatordates", indicatorDate.dateId]);
    }
}

