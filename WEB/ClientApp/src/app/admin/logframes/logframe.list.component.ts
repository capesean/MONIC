import { Component as NgComponent, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { PagingHeaders } from '../../common/models/http.model';
import { LogFrameSearchOptions, LogFrameSearchResponse, LogFrame } from '../../common/models/logframe.model';
import { ErrorService } from '../../common/services/error.service';
import { LogFrameService } from '../../common/services/logframe.service';

@NgComponent({
    selector: 'logframe-list',
    templateUrl: './logframe.list.component.html'
})
export class LogFrameListComponent implements OnInit, OnDestroy {

    public logFrames: LogFrame[] = [];
    public searchOptions = new LogFrameSearchOptions();
    public headers = new PagingHeaders();
    private routerSubscription: Subscription;

    constructor(
        public route: ActivatedRoute,
        private router: Router,
        private errorService: ErrorService,
        private logFrameService: LogFrameService
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

    runSearch(pageIndex = 0): Subject<LogFrameSearchResponse> {

        this.searchOptions.pageIndex = pageIndex;

        const subject = new Subject<LogFrameSearchResponse>();

        this.logFrameService.search(this.searchOptions)
            .subscribe({
                next: response => {
                    subject.next(response);
                    this.logFrames = response.logFrames;
                    this.headers = response.headers;
                },
                error: err => {
                    this.errorService.handleError(err, "Logical Frameworks", "Load");
                }
            });

        return subject;

    }

    goToLogFrame(logFrame: LogFrame): void {
        this.router.navigate([logFrame.logFrameId], { relativeTo: this.route });
    }
}

