import { Component as NgComponent, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { PagingHeaders } from '../../common/models/http.model';
import { ErrorService } from '../../common/services/error.service';
import { SubcategorySearchOptions, SubcategorySearchResponse, Subcategory } from '../../common/models/subcategory.model';
import { FadeThenShrink } from '../../common/animations/fadethenshrink';
import { SubcategoryService } from '../../common/services/subcategory.service';
import { ToastrService } from 'ngx-toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SubcategorySortComponent } from './subcategory.sort.component';

@NgComponent({
    selector: 'subcategory-list',
    templateUrl: './subcategory.list.component.html',
    animations: [FadeThenShrink]
})
export class SubcategoryListComponent implements OnInit {

    public subcategories: Subcategory[] = [];
    public searchOptions = new SubcategorySearchOptions();
    public showSearchOptions = false;
    public headers = new PagingHeaders();
    private routerSubscription: Subscription;

    constructor(
        public route: ActivatedRoute,
        private router: Router,
        private errorService: ErrorService,
        private modalService: NgbModal,
        private subcategoryService: SubcategoryService
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

    runSearch(pageIndex = 0): Subject<SubcategorySearchResponse> {

        this.searchOptions.pageIndex = pageIndex;

        const subject = new Subject<SubcategorySearchResponse>();

        this.subcategoryService.search(this.searchOptions)
            .subscribe({
                next: response => {
                    subject.next(response);
                    this.subcategories = response.subcategories;
                    this.headers = response.headers;
                },
                error: err => {
                    this.errorService.handleError(err, "Subcategories", "Load");
                }
            });

        return subject;

    }

    showSort() {
        let modalRef = this.modalService.open(SubcategorySortComponent, { size: 'xl', centered: true, scrollable: true });
        modalRef.result.then(
            () => {

                this.runSearch(this.headers.pageIndex);

            }, () => { });
    }

    goToSubcategory(subcategory: Subcategory): void {
        this.router.navigate(["/categories", subcategory.category.categoryId, "subcategories", subcategory.subcategoryId]);
    }
}

