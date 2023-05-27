import { Component as NgComponent, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PagingHeaders } from '../../common/models/http.model';
import { LogFrameRowSearchOptions, LogFrameRowSearchResponse, LogFrameRow } from '../../common/models/logframerow.model';
import { Enum, Enums } from '../../common/models/enums.model';
import { ErrorService } from '../../common/services/error.service';
import { LogFrameRowService } from '../../common/services/logframerow.service';
import { LogFrameRowSortComponent } from './logframerow.sort.component';

@NgComponent({
    selector: 'logframerow-list',
    templateUrl: './logframerow.list.component.html'
})
export class LogFrameRowListComponent implements OnInit, OnDestroy {

    public logFrameRows: LogFrameRow[] = [];
    public searchOptions = new LogFrameRowSearchOptions();
    public headers = new PagingHeaders();
    private routerSubscription: Subscription;
    public logFrameRowTypes: Enum[] = Enums.LogFrameRowTypes;

    constructor(
        public route: ActivatedRoute,
        private router: Router,
        private errorService: ErrorService,
        private modalService: NgbModal,
        private logFrameRowService: LogFrameRowService
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

    runSearch(pageIndex = 0): Subject<LogFrameRowSearchResponse> {

        this.searchOptions.pageIndex = pageIndex;

        const subject = new Subject<LogFrameRowSearchResponse>();

        this.logFrameRowService.search(this.searchOptions)
            .subscribe({
                next: response => {
                    subject.next(response);
                    this.logFrameRows = response.logFrameRows;
                    this.headers = response.headers;
                },
                error: err => {
                    this.errorService.handleError(err, "LogFrame Rows", "Load");
                }
            });

        return subject;

    }

    showSort(): void {
        let modalRef = this.modalService.open(LogFrameRowSortComponent, { size: 'xl', centered: true, scrollable: true });
        modalRef.result.then(
            () => {

                this.searchOptions.orderBy = null;
                this.runSearch(this.headers.pageIndex);

            }, () => { });
    }

    goToLogFrameRow(logFrameRow: LogFrameRow): void {
        this.router.navigate(["/logframes", logFrameRow.logFrame.logFrameId, "logframerows", logFrameRow.logFrameRowId]);
    }
}

