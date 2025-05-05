import { Component as NgComponent, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { PagingHeaders } from '../../common/models/http.model';
import { OptionValueSearchOptions, OptionValueSearchResponse, OptionValue } from '../../common/models/optionvalue.model';
import { FadeThenShrink } from '../../common/animations/fadethenshrink';
import { ErrorService } from '../../common/services/error.service';
import { OptionValueService } from '../../common/services/optionvalue.service';

@NgComponent({
    selector: 'optionvalue-list',
    templateUrl: './optionvalue.list.component.html',
    animations: [FadeThenShrink],
    standalone: false
})
export class OptionValueListComponent implements OnInit, OnDestroy {

    public optionValues: OptionValue[] = [];
    public searchOptions = new OptionValueSearchOptions();
    public showSearchOptions = false;
    public headers = new PagingHeaders();
    private routerSubscription: Subscription;

    constructor(
        public route: ActivatedRoute,
        private router: Router,
        private errorService: ErrorService,
        private optionValueService: OptionValueService
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

    runSearch(pageIndex = 0): Subject<OptionValueSearchResponse> {

        this.searchOptions.pageIndex = pageIndex;

        const subject = new Subject<OptionValueSearchResponse>();

        this.optionValueService.search(this.searchOptions)
            .subscribe({
                next: response => {
                    subject.next(response);
                    this.optionValues = response.optionValues;
                    this.headers = response.headers;
                },
                error: err => {
                    this.errorService.handleError(err, "Option Values", "Load");
                }
            });

        return subject;

    }

    goToOptionValue(optionValue: OptionValue): void {
        this.router.navigate([optionValue.itemId, optionValue.optionId], { relativeTo: this.route });
    }
}

