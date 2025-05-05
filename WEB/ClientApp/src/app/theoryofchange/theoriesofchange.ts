import { Component as NgComponent, OnDestroy, OnInit } from '@angular/core';
import { ErrorService } from '../common/services/error.service';
import { TheoryOfChange, TheoryOfChangeSearchOptions } from '../common/models/theoryofchange.model';
import { TheoryOfChangeService } from '../common/services/theoryofchange.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { PagingHeaders } from '../common/models/http.model';
import { Subscription } from 'rxjs';

@NgComponent({
    selector: 'app-theoriesofchange',
    templateUrl: './theoriesofchange.html',
    standalone: false
})
export class TheoriesOfChangeComponent implements OnInit, OnDestroy {

    public theoriesOfChange: TheoryOfChange[] = [];
    public searchOptions = new TheoryOfChangeSearchOptions();
    public headers = new PagingHeaders();

    private routerSubscription: Subscription;

    constructor(
        public route: ActivatedRoute,
        private router: Router,
        private errorService: ErrorService,
        private theoryOfChangeService: TheoryOfChangeService,
    ) {
    }

    public ngOnInit(): void {
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

        this.theoryOfChangeService.search(this.searchOptions)
            .subscribe({
                next: response => {
                    this.theoriesOfChange = response.theoriesOfChange;
                    this.headers = response.headers;
                },
                error: err => {
                    this.errorService.handleError(err, "Theories of Change", "Load");
                }
            });

    }

    public selectTheoryOfChange(toc: TheoryOfChange): void {
        this.router.navigate([toc.theoryOfChangeId], { relativeTo: this.route });
    }

}
