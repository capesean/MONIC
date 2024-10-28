import { Component as NgComponent, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { PagingHeaders } from '../../common/models/http.model';
import { ItemSearchOptions, ItemSearchResponse, Item } from '../../common/models/item.model';
import { Enum, Enums } from '../../common/models/enums.model';
import { FadeThenShrink } from '../../common/animations/fadethenshrink';
import { ErrorService } from '../../common/services/error.service';
import { ItemService } from '../../common/services/item.service';

@NgComponent({
    selector: 'item-list',
    templateUrl: './item.list.component.html',
    animations: [FadeThenShrink]
})
export class ItemListComponent implements OnInit, OnDestroy {

    public items: Item[] = [];
    public searchOptions = new ItemSearchOptions();
    public showSearchOptions = false;
    public headers = new PagingHeaders();
    private routerSubscription: Subscription;
    public itemTypes: Enum[] = Enums.ItemTypes;

    constructor(
        public route: ActivatedRoute,
        private router: Router,
        private errorService: ErrorService,
        private itemService: ItemService
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

    runSearch(pageIndex = 0): Subject<ItemSearchResponse> {

        this.searchOptions.pageIndex = pageIndex;

        const subject = new Subject<ItemSearchResponse>();

        this.itemService.search(this.searchOptions)
            .subscribe({
                next: response => {
                    subject.next(response);
                    this.items = response.items;
                    this.headers = response.headers;
                },
                error: err => {
                    this.errorService.handleError(err, "Items", "Load");
                }
            });

        return subject;

    }

    goToItem(item: Item): void {
        this.router.navigate([item.itemId], { relativeTo: this.route });
    }
}

