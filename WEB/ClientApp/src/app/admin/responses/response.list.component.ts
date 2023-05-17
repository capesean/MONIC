import { Component as NgComponent, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { PagingHeaders } from '../../common/models/http.model';
import { ResponseSearchOptions, ResponseSearchResponse, Response } from '../../common/models/response.model';
import { ErrorService } from '../../common/services/error.service';
import { ResponseService } from '../../common/services/response.service';

@NgComponent({
    selector: 'response-list',
    templateUrl: './response.list.component.html'
})
export class ResponseListComponent implements OnInit, OnDestroy {

    public responses: Response[] = [];
    public searchOptions = new ResponseSearchOptions();
    public headers = new PagingHeaders();
    private routerSubscription: Subscription;

    constructor(
        public route: ActivatedRoute,
        private router: Router,
        private errorService: ErrorService,
        private responseService: ResponseService
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

    runSearch(pageIndex = 0): Subject<ResponseSearchResponse> {

        this.searchOptions.pageIndex = pageIndex;

        const subject = new Subject<ResponseSearchResponse>();

        this.responseService.search(this.searchOptions)
            .subscribe({
                next: response => {
                    subject.next(response);
                    this.responses = response.responses;
                    this.headers = response.headers;
                },
                error: err => {
                    this.errorService.handleError(err, "Responses", "Load");
                }
            });

        return subject;

    }

    goToResponse(response: Response): void {
        this.router.navigate(["/questionnaires", response.questionnaire.questionnaireId, "responses", response.responseId]);
    }
}

