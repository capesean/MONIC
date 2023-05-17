import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { PagingHeaders } from '../common/models/http.model';
import { LogFrame, LogFrameSearchOptions } from '../common/models/logframe.model';
import { ErrorService } from '../common/services/error.service';
import { LogFrameService } from '../common/services/logframe.service';
import { OnDestroy } from '@angular/core';

@Component({
    selector: 'app-logframes',
    templateUrl: './logframes.component.html'
})
export class LogFramesComponent implements OnInit, OnDestroy {

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

    runSearch(pageIndex = 0): void {

        this.searchOptions.pageIndex = pageIndex;

        this.logFrameService.search(this.searchOptions)
            .subscribe({
                next: response => {
                    this.logFrames = response.logFrames;
                    this.headers = response.headers;
                },
                error: err => {
                    this.errorService.handleError(err, "Logical Frameworks", "Load");
                }
            });

    }

    selectLogFrame(logFrame: LogFrame): void {
        this.router.navigate([logFrame.logFrameId], { relativeTo: this.route });
    }

}
