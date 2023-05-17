import { Component as NgComponent, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { PagingHeaders } from '../../common/models/http.model';
import { LogFrameRowComponentSearchOptions, LogFrameRowComponentSearchResponse, LogFrameRowComponent } from '../../common/models/logframerowcomponent.model';
import { ErrorService } from '../../common/services/error.service';
import { LogFrameRowComponentService } from '../../common/services/logframerowcomponent.service';

@NgComponent({
    selector: 'logframerowcomponent-list',
    templateUrl: './logframerowcomponent.list.component.html'
})
export class LogFrameRowComponentListComponent implements OnInit {

    public logFrameRowComponents: LogFrameRowComponent[] = [];
    public searchOptions = new LogFrameRowComponentSearchOptions();
    public headers = new PagingHeaders();

    constructor(
        public route: ActivatedRoute,
        private router: Router,
        private errorService: ErrorService,
        private logFrameRowComponentService: LogFrameRowComponentService
    ) {
    }

    ngOnInit(): void {
        this.searchOptions.includeParents = true;
        this.runSearch();
    }

    runSearch(pageIndex = 0): Subject<LogFrameRowComponentSearchResponse> {

        this.searchOptions.pageIndex = pageIndex;

        const subject = new Subject<LogFrameRowComponentSearchResponse>();

        this.logFrameRowComponentService.search(this.searchOptions)
            .subscribe({
                next: response => {
                    subject.next(response);
                    this.logFrameRowComponents = response.logFrameRowComponents;
                    this.headers = response.headers;
                },
                error: err => {
                    this.errorService.handleError(err, "Log Frame Row Components", "Load");
                }
            });

        return subject;

    }

    goToLogFrameRowComponent(logFrameRowComponent: LogFrameRowComponent): void {
        this.router.navigate(["/logframes", logFrameRowComponent.logFrameRow.logFrame.logFrameId, "logframerows", logFrameRowComponent.logFrameRow.logFrameRowId, "logframerowcomponents", logFrameRowComponent.componentId]);
    }
}

