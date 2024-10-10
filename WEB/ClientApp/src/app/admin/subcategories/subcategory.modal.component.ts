import { Component as NgComponent, OnInit, ViewChild, Output, EventEmitter, TemplateRef, Input } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { SubcategorySearchOptions, SubcategorySearchResponse, Subcategory } from '../../common/models/subcategory.model';
import { SubcategoryService } from '../../common/services/subcategory.service';
import { PagingHeaders } from '../../common/models/http.model';
import { ErrorService } from '../../common/services/error.service';
import { Category } from '../../common/models/category.model';

@NgComponent({
    selector: 'subcategory-modal',
    templateUrl: './subcategory.modal.component.html'
})
export class SubcategoryModalComponent implements OnInit {

    public modal: NgbModalRef;
    public selectedItems: Subcategory[] = [];
    public headers: PagingHeaders = new PagingHeaders();
    public searchOptions: SubcategorySearchOptions = new SubcategorySearchOptions();
    public subcategories: Subcategory[];
    public allSelected = false;

    @ViewChild('content') content: TemplateRef<unknown>;
    @Output() change: EventEmitter<Subcategory> = new EventEmitter<Subcategory>();
    @Output() changes: EventEmitter<Subcategory[]> = new EventEmitter<Subcategory[]>();
    @Input() canRemoveFilters = false;
    @Input() multiple = false;
    @Input() showAddNew = false;
    @Input() showFilters = true;
    @Input() showFooter = true;
    @Input() resetOnOpen = false;
    @Input() title = this.multiple ? "Select subcategories" : "Select a subcategory";
    @Input() category: Category;

    constructor(
        private modalService: NgbModal,
        private subcategoryService: SubcategoryService,
        private errorService: ErrorService
    ) {
    }

    ngOnInit(): void {
        this.searchOptions.includeParents = true;
    }

    open(): NgbModalRef {
        if (this.resetOnOpen) this.selectedItems = [];
        this.searchOptions.categoryId = this.category?.categoryId;
        this.modal = this.modalService.open(this.content, { size: 'xl', centered: true, scrollable: true });
        this.runSearch();
        this.modal.result.then((subcategory: Subcategory | Subcategory[]) => {
            if (this.multiple) this.changes.emit(subcategory as Subcategory[]);
            else this.change.emit(subcategory as Subcategory);
        }, () => {
            // dismissed
        });
        return this.modal;
    }

    public runSearch(pageIndex = 0): Observable<SubcategorySearchResponse> {

        this.searchOptions.pageIndex = pageIndex;
        this.allSelected = false;

        const observable = this.subcategoryService
            .search(this.searchOptions);

        observable.subscribe({
            next: response => {
                this.subcategories = response.subcategories;
                this.headers = response.headers;
            },
            error: err => {

                this.errorService.handleError(err, "Subcategories", "Load");

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

    select(subcategory: Subcategory) {
        if (this.multiple) {
            if (this.isSelected(subcategory)) {
                for (let i = 0; i < this.selectedItems.length; i++) {
                    if (this.selectedItems[i].subcategoryId === subcategory.subcategoryId) {
                        this.selectedItems.splice(i, 1);
                        break;
                    }
                }
            } else {
                this.selectedItems.push(subcategory);
            }
        } else {
            this.modal.close(subcategory);
        }
    }

    isSelected(subcategory: Subcategory) {
        if (!this.multiple) return false;
        return this.selectedItems.filter(item => item.subcategoryId === subcategory.subcategoryId).length > 0;
    }

    toggleAll() {
        this.allSelected = !this.allSelected;
        this.subcategories.forEach(subcategory => {
            const isSelected = this.isSelected(subcategory);
			if (isSelected && !this.allSelected) {
                for (let i = 0; i < this.selectedItems.length; i++) {
                    if (this.selectedItems[i].subcategoryId === subcategory.subcategoryId) {
                        this.selectedItems.splice(i, 1);
                        break;
                    }
                }
            } else if (!isSelected && this.allSelected) {
                this.selectedItems.push(subcategory);
            }
        });
    }

    selectAll() {

        const oldPageSize = this.searchOptions.pageSize;
        this.searchOptions.pageSize = 0;
        this.searchOptions.pageIndex = 0;

        this.subcategoryService.search(this.searchOptions)
            .subscribe({
                next: response => {
                    this.modal.close(response.subcategories);
                    this.subcategories = response.subcategories;
                    this.searchOptions.pageSize = oldPageSize;
                },
                error: err => {
                    this.errorService.handleError(err, "Subcategories", "Load");
                }
            });

    }

    addNew() {
        window.open("/subcategories/add", "_blank");
    }
}
