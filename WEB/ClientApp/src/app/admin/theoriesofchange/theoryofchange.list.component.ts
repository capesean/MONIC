import { Component as NgComponent, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { PagingHeaders } from '../../common/models/http.model';
import { TheoryOfChangeSearchOptions, TheoryOfChangeSearchResponse, TheoryOfChange } from '../../common/models/theoryofchange.model';
import { ErrorService } from '../../common/services/error.service';
import { TheoryOfChangeService } from '../../common/services/theoryofchange.service';

@NgComponent({
    selector: 'theoryofchange-list',
    templateUrl: './theoryofchange.list.component.html'
})
export class TheoryOfChangeListComponent implements OnInit, OnDestroy {

    public theoriesOfChange: TheoryOfChange[] = [];
    public searchOptions = new TheoryOfChangeSearchOptions();
    public headers = new PagingHeaders();
    private routerSubscription: Subscription;

    constructor(
        public route: ActivatedRoute,
        private router: Router,
        private errorService: ErrorService,
        private theoryOfChangeService: TheoryOfChangeService
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

    runSearch(pageIndex = 0): Subject<TheoryOfChangeSearchResponse> {

        this.searchOptions.pageIndex = pageIndex;

        const subject = new Subject<TheoryOfChangeSearchResponse>();

        this.theoryOfChangeService.search(this.searchOptions)
            .subscribe({
                next: response => {
                    subject.next(response);
                    this.theoriesOfChange = response.theoriesOfChange;
                    this.headers = response.headers;
                },
                error: err => {
                    this.errorService.handleError(err, "Theories of Change", "Load");
                }
            });

        return subject;

    }

    goToTheoryOfChange(theoryOfChange: TheoryOfChange): void {
        this.router.navigate([theoryOfChange.theoryOfChangeId], { relativeTo: this.route });
    }
}

