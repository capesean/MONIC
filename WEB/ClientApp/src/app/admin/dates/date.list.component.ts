import { Component as NgComponent, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PagingHeaders } from '../../common/models/http.model';
import { DateSearchOptions, DateSearchResponse, Date } from '../../common/models/date.model';
import { Enum, Enums } from '../../common/models/enums.model';
import { FadeThenShrink } from '../../common/animations/fadethenshrink';
import { ErrorService } from '../../common/services/error.service';
import { DateService } from '../../common/services/date.service';
import { DateSortComponent } from './date.sort.component';

@NgComponent({
    selector: 'date-list',
    templateUrl: './date.list.component.html',
    animations: [FadeThenShrink]
})
export class DateListComponent implements OnInit, OnDestroy {

    public dates: Date[] = [];
    public searchOptions = new DateSearchOptions();
    public showSearchOptions = false;
    public headers = new PagingHeaders();
    private routerSubscription: Subscription;
    public dateTypes: Enum[] = Enums.DateTypes;

    constructor(
        public route: ActivatedRoute,
        private router: Router,
        private errorService: ErrorService,
        private modalService: NgbModal,
        private dateService: DateService
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

    runSearch(pageIndex = 0): Subject<DateSearchResponse> {

        this.searchOptions.pageIndex = pageIndex;

        const subject = new Subject<DateSearchResponse>();

        this.dateService.search(this.searchOptions)
            .subscribe({
                next: response => {
                    subject.next(response);
                    this.dates = response.dates;
                    this.headers = response.headers;
                },
                error: err => {
                    this.errorService.handleError(err, "Dates", "Load");
                }
            });

        return subject;

    }

    showSort(): void {
        let modalRef = this.modalService.open(DateSortComponent, { size: 'xl', centered: true, scrollable: false });
        modalRef.result.then(
            () => {

                this.searchOptions.orderBy = null;
                this.runSearch(this.headers.pageIndex);

            }, () => { });
    }

    goToDate(date: Date): void {
        this.router.navigate([date.dateId], { relativeTo: this.route });
    }
}

