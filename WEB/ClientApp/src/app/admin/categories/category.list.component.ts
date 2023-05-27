import { Component as NgComponent, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PagingHeaders } from '../../common/models/http.model';
import { CategorySearchOptions, CategorySearchResponse, Category } from '../../common/models/category.model';
import { ErrorService } from '../../common/services/error.service';
import { CategoryService } from '../../common/services/category.service';
import { CategorySortComponent } from './category.sort.component';

@NgComponent({
    selector: 'category-list',
    templateUrl: './category.list.component.html'
})
export class CategoryListComponent implements OnInit, OnDestroy {

    public categories: Category[] = [];
    public searchOptions = new CategorySearchOptions();
    public headers = new PagingHeaders();
    private routerSubscription: Subscription;

    constructor(
        public route: ActivatedRoute,
        private router: Router,
        private errorService: ErrorService,
        private modalService: NgbModal,
        private categoryService: CategoryService
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

    runSearch(pageIndex = 0): Subject<CategorySearchResponse> {

        this.searchOptions.pageIndex = pageIndex;

        const subject = new Subject<CategorySearchResponse>();

        this.categoryService.search(this.searchOptions)
            .subscribe({
                next: response => {
                    subject.next(response);
                    this.categories = response.categories;
                    this.headers = response.headers;
                },
                error: err => {
                    this.errorService.handleError(err, "Categories", "Load");
                }
            });

        return subject;

    }

    showSort(): void {
        let modalRef = this.modalService.open(CategorySortComponent, { size: 'xl', centered: true, scrollable: true });
        modalRef.result.then(
            () => {

                this.searchOptions.orderBy = null;
                this.runSearch(this.headers.pageIndex);

            }, () => { });
    }

    goToCategory(category: Category): void {
        this.router.navigate([category.categoryId], { relativeTo: this.route });
    }
}

