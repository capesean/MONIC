import { Component as NgComponent, OnInit, ViewChild, Output, EventEmitter, TemplateRef, Input } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { CategorySearchOptions, CategorySearchResponse, Category } from '../../common/models/category.model';
import { CategoryService } from '../../common/services/category.service';
import { PagingHeaders } from '../../common/models/http.model';
import { ErrorService } from '../../common/services/error.service';

@NgComponent({
    selector: 'category-modal',
    templateUrl: './category.modal.component.html'
})
export class CategoryModalComponent implements OnInit {

    public modal: NgbModalRef;
    public selectedItems: Category[] = [];
    public headers: PagingHeaders = new PagingHeaders();
    public searchOptions: CategorySearchOptions = new CategorySearchOptions();
    public categories: Category[];
    public allSelected = false;

    @ViewChild('content') content: TemplateRef<unknown>;
    @Output() change: EventEmitter<Category> = new EventEmitter<Category>();
    @Output() changes: EventEmitter<Category[]> = new EventEmitter<Category[]>();
    @Input() canRemoveFilters = false;
    @Input() multiple = false;
    @Input() showAddNew = false;
    @Input() showFooter = true;
    @Input() resetOnOpen = false;
    @Input() title = this.multiple ? "Select categories" : "Select a category";

    constructor(
        private modalService: NgbModal,
        private categoryService: CategoryService,
        private errorService: ErrorService
    ) {
    }

    ngOnInit(): void {
        this.searchOptions.includeParents = true;
    }

    open(): NgbModalRef {
        if (this.resetOnOpen) this.selectedItems = [];
        this.modal = this.modalService.open(this.content, { size: 'xl', centered: true, scrollable: true });
        this.runSearch();
        this.modal.result.then((category: Category | Category[]) => {
            if (this.multiple) this.changes.emit(category as Category[]);
            else this.change.emit(category as Category);
        }, () => {
            // dismissed
        });
        return this.modal;
    }

    public runSearch(pageIndex = 0): Observable<CategorySearchResponse> {

        this.searchOptions.pageIndex = pageIndex;
        this.allSelected = false;

        const observable = this.categoryService
            .search(this.searchOptions);

        observable.subscribe({
            next: response => {
                this.categories = response.categories;
                this.headers = response.headers;
            },
            error: err => {

                this.errorService.handleError(err, "Categories", "Load");

            }
        });

        return observable;

    }

    close() {
        if (this.multiple) this.modal.close(this.selectedItems);
        else this.modal.dismiss();
    }

    clear() {
        if (this.multiple) { this.selectedItems = []; this.modal.close([]); }
        else this.modal.close(undefined);
    }

    select(category: Category) {
        if (this.multiple) {
            if (this.isSelected(category)) {
                for (let i = 0; i < this.selectedItems.length; i++) {
                    if (this.selectedItems[i].categoryId === category.categoryId) {
                        this.selectedItems.splice(i, 1);
                        break;
                    }
                }
            } else {
                this.selectedItems.push(category);
            }
        } else {
            this.modal.close(category);
        }
    }

    isSelected(category: Category) {
        if (!this.multiple) return false;
        return this.selectedItems.filter(item => item.categoryId === category.categoryId).length > 0;
    }

    toggleAll() {
        this.allSelected = !this.allSelected;
        this.categories.forEach(category => {
            const isSelected = this.isSelected(category);
			if (isSelected && !this.allSelected) {
                for (let i = 0; i < this.selectedItems.length; i++) {
                    if (this.selectedItems[i].categoryId === category.categoryId) {
                        this.selectedItems.splice(i, 1);
                        break;
                    }
                }
            } else if (!isSelected && this.allSelected) {
                this.selectedItems.push(category);
            }
        });
    }

    selectAll() {

        const oldPageSize = this.searchOptions.pageSize;
        this.searchOptions.pageSize = 0;
        this.searchOptions.pageIndex = 0;

        this.categoryService.search(this.searchOptions)
            .subscribe({
                next: response => {
                    this.modal.close(response.categories);
                    this.categories = response.categories;
                    this.searchOptions.pageSize = oldPageSize;
                },
                error: err => {
                    this.errorService.handleError(err, "Categories", "Load");
                }
            });

    }

    addNew() {
        window.open("/categories/add", "_blank");
    }
}
