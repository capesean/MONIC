import { Component as NgComponent, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { PagingHeaders } from '../common/models/http.model';
import { ChartSearchOptions, ChartSearchResponse, Chart } from '../common/models/chart.model';
import { FadeThenShrink } from '../common/animations/fadethenshrink';
import { ErrorService } from '../common/services/error.service';
import { ChartService } from '../common/services/chart.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmModalComponent, ConfirmModalOptions } from '../common/components/confirm.component';
import { ToastrService } from 'ngx-toastr';

@NgComponent({
    selector: 'charts',
    templateUrl: './charts.component.html',
    animations: [FadeThenShrink],
    standalone: false
})
export class ChartsComponent implements OnInit, OnDestroy {

    public charts: Chart[] = [];
    public searchOptions = new ChartSearchOptions();
    public showSearchOptions = false;
    public headers = new PagingHeaders();
    private routerSubscription: Subscription;

    constructor(
        public route: ActivatedRoute,
        private router: Router,
        private errorService: ErrorService,
        private chartService: ChartService,
        private modalService: NgbModal,
        private toastr: ToastrService
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

    deleteChart($event: MouseEvent, chart: Chart): void {
        $event.stopPropagation();

        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Chart", text: "Are you sure you want to delete this chart?", deleteStyle: true, ok: "Delete" } as ConfirmModalOptions;
        modalRef.result.then(
            () => {

                this.chartService.delete(chart.chartId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The chart has been deleted", "Delete Chart");
                            this.runSearch();
                        },
                        error: err => {
                            this.errorService.handleError(err, "Chart", "Delete");
                        }
                    });

            }, () => { });
    }

}

