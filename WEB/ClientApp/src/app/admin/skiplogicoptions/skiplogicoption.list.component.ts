import { Component as NgComponent, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { PagingHeaders } from '../../common/models/http.model';
import { SkipLogicOptionSearchOptions, SkipLogicOptionSearchResponse, SkipLogicOption } from '../../common/models/skiplogicoption.model';
import { FadeThenShrink } from '../../common/animations/fadethenshrink';
import { ErrorService } from '../../common/services/error.service';
import { SkipLogicOptionService } from '../../common/services/skiplogicoption.service';

@NgComponent({
    selector: 'skiplogicoption-list',
    templateUrl: './skiplogicoption.list.component.html',
    animations: [FadeThenShrink]
})
export class SkipLogicOptionListComponent implements OnInit, OnDestroy {

    public skipLogicOptions: SkipLogicOption[] = [];
    public searchOptions = new SkipLogicOptionSearchOptions();
    public showSearchOptions = false;
    public headers = new PagingHeaders();
    private routerSubscription: Subscription;

    constructor(
        public route: ActivatedRoute,
        private router: Router,
        private errorService: ErrorService,
        private skipLogicOptionService: SkipLogicOptionService
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

    runSearch(pageIndex = 0): Subject<SkipLogicOptionSearchResponse> {

        this.searchOptions.pageIndex = pageIndex;

        const subject = new Subject<SkipLogicOptionSearchResponse>();

        this.skipLogicOptionService.search(this.searchOptions)
            .subscribe({
                next: response => {
                    subject.next(response);
                    this.skipLogicOptions = response.skipLogicOptions;
                    this.headers = response.headers;
                },
                error: err => {
                    this.errorService.handleError(err, "Skip Logic Options", "Load");
                }
            });

        return subject;

    }

    goToSkipLogicOption(skipLogicOption: SkipLogicOption): void {
        this.router.navigate([skipLogicOption.questionId, skipLogicOption.checkQuestionOptionId], { relativeTo: this.route });
    }
}

