import { Component as NgComponent, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CdkDragDrop, CdkDragStart, moveItemInArray } from '@angular/cdk/drag-drop';
import { CategorySearchOptions, CategorySearchResponse, Category } from '../../common/models/category.model';
import { CategoryService } from '../../common/services/category.service';
import { PagingHeaders } from '../../common/models/http.model';
import { ErrorService } from '../../common/services/error.service';
import { ToastrService } from 'ngx-toastr';

@NgComponent({
    selector: 'category-sort',
    templateUrl: './category.sort.component.html',
    standalone: false
})
export class CategorySortComponent implements OnInit {

    public headers: PagingHeaders = new PagingHeaders();
    private bodyElement: HTMLElement = document.body;
    public categories: Category[];

    constructor(
        public modal: NgbActiveModal,
        private categoryService: CategoryService,
        private errorService: ErrorService,
        private toastr: ToastrService
    ) {
    }

    ngOnInit(): void {
        this.categoryService.search({ pageSize: 0, includeParents: true } as CategorySearchOptions)
            .subscribe({
                next: response => this.categories = response.categories,
                error: err => this.errorService.handleError(err, "Categories", "Load")
            });
    }

    dragStart(event: CdkDragStart) {
        this.bodyElement.classList.add('inheritCursors');
        this.bodyElement.style.cursor = 'grabbing';
    }

    drop(event: CdkDragDrop<Category[]>) {
        this.bodyElement.classList.remove('inheritCursors');
        this.bodyElement.style.cursor = 'unset';
        moveItemInArray(this.categories, event.previousIndex, event.currentIndex);
    }

    close() {
        this.categoryService.sort(this.categories.map(o => o.categoryId))
            .subscribe({
                next: () => {
                    this.modal.close();
                    this.toastr.success("The sort order has been updated", "Change Sort Order");
                },
                error: err => {
                    this.errorService.handleError(err, "Categories", "Sort");
                }
            });
    }

}

