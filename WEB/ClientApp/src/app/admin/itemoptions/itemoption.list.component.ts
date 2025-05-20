import { Component as NgComponent, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { PagingHeaders } from '../../common/models/http.model';
import { ItemOptionSearchOptions, ItemOptionSearchResponse, ItemOption } from '../../common/models/itemoption.model';
import { FadeThenShrink } from '../../common/animations/fadethenshrink';
import { ErrorService } from '../../common/services/error.service';
import { ItemOptionService } from '../../common/services/itemoption.service';

@NgComponent({
    selector: 'itemoption-list',
    templateUrl: './itemoption.list.component.html',
    animations: [FadeThenShrink],
    standalone: false
})
export class ItemOptionListComponent implements OnInit, OnDestroy {

    public itemOptions: ItemOption[] = [];
    public searchOptions = new ItemOptionSearchOptions();
    public showSearchOptions = false;
    public headers = new PagingHeaders();
    private routerSubscription: Subscription;

    constructor(
        public route: ActivatedRoute,
        private router: Router,
        private errorService: ErrorService,
        private itemOptionService: ItemOptionService
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

    runSearch(pageIndex = 0): Subject<ItemOptionSearchResponse> {

        this.searchOptions.pageIndex = pageIndex;

        const subject = new Subject<ItemOptionSearchResponse>();

        this.itemOptionService.search(this.searchOptions)
            .subscribe({
                next: response => {
                    subject.next(response);
                    this.itemOptions = response.itemOptions;
                    this.headers = response.headers;
                },
                error: err => {
                    this.errorService.handleError(err, "Item Options", "Load");
                }
            });

        return subject;

    }

    goToItemOption(itemOption: ItemOption): void {
        this.router.navigate([itemOption.itemId, itemOption.optionId], { relativeTo: this.route });
    }
}

