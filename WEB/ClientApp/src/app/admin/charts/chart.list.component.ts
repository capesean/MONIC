import { Component as NgComponent, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { PagingHeaders } from '../../common/models/http.model';
import { ChartSearchOptions, ChartSearchResponse, Chart } from '../../common/models/chart.model';
import { FadeThenShrink } from '../../common/animations/fadethenshrink';
import { ErrorService } from '../../common/services/error.service';
import { ChartService } from '../../common/services/chart.service';

@NgComponent({
    selector: 'chart-list',
    templateUrl: './chart.list.component.html',
    animations: [FadeThenShrink],
    standalone: false
})
export class ChartListComponent implements OnInit, OnDestroy {

    public charts: Chart[] = [];
    public searchOptions = new ChartSearchOptions();
    public showSearchOptions = false;
    public headers = new PagingHeaders();
    private routerSubscription: Subscription;

    constructor(
        public route: ActivatedRoute,
        private router: Router,
        private errorService: ErrorService,
        private chartService: ChartService
    ) {
    }

    ngOnInit(): void {
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

    runSearch(pageIndex = 0): Subject<ChartSearchResponse> {

        this.searchOptions.pageIndex = pageIndex;

        const subject = new Subject<ChartSearchResponse>();

        this.chartService.search(this.searchOptions)
            .subscribe({
                next: response => {
                    subject.next(response);
                    this.charts = response.charts;
                    this.headers = response.headers;
                },
                error: err => {
                    this.errorService.handleError(err, "Charts", "Load");
                }
            });

        return subject;

    }

    goToChart(chart: Chart): void {
        this.router.navigate([chart.chartId], { relativeTo: this.route });
    }
}

