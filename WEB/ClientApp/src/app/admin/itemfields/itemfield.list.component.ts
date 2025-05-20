import { Component as NgComponent, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { PagingHeaders } from '../../common/models/http.model';
import { ItemFieldSearchOptions, ItemFieldSearchResponse, ItemField } from '../../common/models/itemfield.model';
import { FadeThenShrink } from '../../common/animations/fadethenshrink';
import { ErrorService } from '../../common/services/error.service';
import { ItemFieldService } from '../../common/services/itemfield.service';

@NgComponent({
    selector: 'itemfield-list',
    templateUrl: './itemfield.list.component.html',
    animations: [FadeThenShrink],
    standalone: false
})
export class ItemFieldListComponent implements OnInit, OnDestroy {

    public itemFields: ItemField[] = [];
    public searchOptions = new ItemFieldSearchOptions();
    public showSearchOptions = false;
    public headers = new PagingHeaders();
    private routerSubscription: Subscription;

    constructor(
        public route: ActivatedRoute,
        private router: Router,
        private errorService: ErrorService,
        private itemFieldService: ItemFieldService
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

    runSearch(pageIndex = 0): Subject<ItemFieldSearchResponse> {

        this.searchOptions.pageIndex = pageIndex;

        const subject = new Subject<ItemFieldSearchResponse>();

        this.itemFieldService.search(this.searchOptions)
            .subscribe({
                next: response => {
                    subject.next(response);
                    this.itemFields = response.itemFields;
                    this.headers = response.headers;
                },
                error: err => {
                    this.errorService.handleError(err, "Item Fields", "Load");
                }
            });

        return subject;

    }

    goToItemField(itemField: ItemField): void {
        this.router.navigate([itemField.itemId, itemField.fieldId], { relativeTo: this.route });
    }
}

