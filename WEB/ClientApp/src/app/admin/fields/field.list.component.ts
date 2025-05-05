import { Component as NgComponent, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PagingHeaders } from '../../common/models/http.model';
import { FieldSearchOptions, FieldSearchResponse, Field } from '../../common/models/field.model';
import { Enum, Enums } from '../../common/models/enums.model';
import { FadeThenShrink } from '../../common/animations/fadethenshrink';
import { ErrorService } from '../../common/services/error.service';
import { FieldService } from '../../common/services/field.service';
import { FieldSortComponent } from './field.sort.component';

@NgComponent({
    selector: 'field-list',
    templateUrl: './field.list.component.html',
    animations: [FadeThenShrink],
    standalone: false
})
export class FieldListComponent implements OnInit, OnDestroy {

    public fields: Field[] = [];
    public searchOptions = new FieldSearchOptions();
    public showSearchOptions = false;
    public headers = new PagingHeaders();
    private routerSubscription: Subscription;
    public sizes: Enum[] = Enums.Sizes;
    public fieldTypes: Enum[] = Enums.FieldTypes;

    constructor(
        public route: ActivatedRoute,
        private router: Router,
        private errorService: ErrorService,
        private modalService: NgbModal,
        private fieldService: FieldService
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

    runSearch(pageIndex = 0): Subject<FieldSearchResponse> {

        this.searchOptions.pageIndex = pageIndex;

        const subject = new Subject<FieldSearchResponse>();

        this.fieldService.search(this.searchOptions)
            .subscribe({
                next: response => {
                    subject.next(response);
                    this.fields = response.fields;
                    this.headers = response.headers;
                },
                error: err => {
                    this.errorService.handleError(err, "Fields", "Load");
                }
            });

        return subject;

    }

    showSort(): void {
        let modalRef = this.modalService.open(FieldSortComponent, { size: 'xl', centered: true, scrollable: false });
        modalRef.result.then(
            () => {

                this.searchOptions.orderBy = null;
                this.runSearch(this.headers.pageIndex);

            }, () => { });
    }

    goToField(field: Field): void {
        this.router.navigate([field.fieldId], { relativeTo: this.route });
    }
}

