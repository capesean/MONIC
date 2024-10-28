import { Component as NgComponent, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { PagingHeaders } from '../../common/models/http.model';
import { LogFrameRowIndicatorSearchOptions, LogFrameRowIndicatorSearchResponse, LogFrameRowIndicator } from '../../common/models/logframerowindicator.model';
import { FadeThenShrink } from '../../common/animations/fadethenshrink';
import { ErrorService } from '../../common/services/error.service';
import { LogFrameRowIndicatorService } from '../../common/services/logframerowindicator.service';

@NgComponent({
    selector: 'logframerowindicator-list',
    templateUrl: './logframerowindicator.list.component.html',
    animations: [FadeThenShrink]
})
export class LogFrameRowIndicatorListComponent implements OnInit {

    public logFrameRowIndicators: LogFrameRowIndicator[] = [];
    public searchOptions = new LogFrameRowIndicatorSearchOptions();
    public showSearchOptions = false;
    public headers = new PagingHeaders();

    constructor(
        public route: ActivatedRoute,
        private router: Router,
        private errorService: ErrorService,
        private logFrameRowIndicatorService: LogFrameRowIndicatorService
    ) {
    }

    ngOnInit(): void {
        this.searchOptions.includeParents = true;
        this.runSearch();
    }

    runSearch(pageIndex = 0): Subject<LogFrameRowIndicatorSearchResponse> {

        this.searchOptions.pageIndex = pageIndex;

        const subject = new Subject<LogFrameRowIndicatorSearchResponse>();

        this.logFrameRowIndicatorService.search(this.searchOptions)
            .subscribe({
                next: response => {
                    subject.next(response);
                    this.logFrameRowIndicators = response.logFrameRowIndicators;
                    this.headers = response.headers;
                },
                error: err => {
                    this.errorService.handleError(err, "Log Frame Row Indicators", "Load");
                }
            });

        return subject;

    }

    goToLogFrameRowIndicator(logFrameRowIndicator: LogFrameRowIndicator): void {
        this.router.navigate(["/logframes", logFrameRowIndicator.logFrameRow.logFrame.logFrameId, "logframerows", logFrameRowIndicator.logFrameRow.logFrameRowId, "logframerowindicators", logFrameRowIndicator.indicatorId]);
    }
}

