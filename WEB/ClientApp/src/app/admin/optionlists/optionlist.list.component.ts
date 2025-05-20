import { Component as NgComponent, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { PagingHeaders } from '../../common/models/http.model';
import { OptionListSearchOptions, OptionListSearchResponse, OptionList } from '../../common/models/optionlist.model';
import { FadeThenShrink } from '../../common/animations/fadethenshrink';
import { ErrorService } from '../../common/services/error.service';
import { OptionListService } from '../../common/services/optionlist.service';

@NgComponent({
    selector: 'optionlist-list',
    templateUrl: './optionlist.list.component.html',
    animations: [FadeThenShrink],
    standalone: false
})
export class OptionListListComponent implements OnInit, OnDestroy {

    public optionLists: OptionList[] = [];
    public searchOptions = new OptionListSearchOptions();
    public showSearchOptions = false;
    public headers = new PagingHeaders();
    private routerSubscription: Subscription;

    constructor(
        public route: ActivatedRoute,
        private router: Router,
        private errorService: ErrorService,
        private optionListService: OptionListService
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

    runSearch(pageIndex = 0): Subject<OptionListSearchResponse> {

        this.searchOptions.pageIndex = pageIndex;

        const subject = new Subject<OptionListSearchResponse>();

        this.optionListService.search(this.searchOptions)
            .subscribe({
                next: response => {
                    subject.next(response);
                    this.optionLists = response.optionLists;
                    this.headers = response.headers;
                },
                error: err => {
                    this.errorService.handleError(err, "Option Lists", "Load");
                }
            });

        return subject;

    }

    goToOptionList(optionList: OptionList): void {
        this.router.navigate([optionList.optionListId], { relativeTo: this.route });
    }
}

