import { Component as NgComponent, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { PagingHeaders } from '../../common/models/http.model';
import { FieldValueSearchOptions, FieldValueSearchResponse, FieldValue } from '../../common/models/fieldvalue.model';
import { FadeThenShrink } from '../../common/animations/fadethenshrink';
import { ErrorService } from '../../common/services/error.service';
import { FieldValueService } from '../../common/services/fieldvalue.service';

@NgComponent({
    selector: 'fieldvalue-list',
    templateUrl: './fieldvalue.list.component.html',
    animations: [FadeThenShrink],
    standalone: false
})
export class FieldValueListComponent implements OnInit, OnDestroy {

    public fieldValues: FieldValue[] = [];
    public searchOptions = new FieldValueSearchOptions();
    public showSearchOptions = false;
    public headers = new PagingHeaders();
    private routerSubscription: Subscription;

    constructor(
        public route: ActivatedRoute,
        private router: Router,
        private errorService: ErrorService,
        private fieldValueService: FieldValueService
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

    runSearch(pageIndex = 0): Subject<FieldValueSearchResponse> {

        this.searchOptions.pageIndex = pageIndex;

        const subject = new Subject<FieldValueSearchResponse>();

        this.fieldValueService.search(this.searchOptions)
            .subscribe({
                next: response => {
                    subject.next(response);
                    this.fieldValues = response.fieldValues;
                    this.headers = response.headers;
                },
                error: err => {
                    this.errorService.handleError(err, "Field Values", "Load");
                }
            });

        return subject;

    }

    goToFieldValue(fieldValue: FieldValue): void {
        this.router.navigate([fieldValue.itemId, fieldValue.fieldId], { relativeTo: this.route });
    }
}

