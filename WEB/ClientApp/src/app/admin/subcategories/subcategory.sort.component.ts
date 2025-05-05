import { Component as NgComponent, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CdkDragDrop, CdkDragStart, moveItemInArray } from '@angular/cdk/drag-drop';
import { SubcategorySearchOptions, SubcategorySearchResponse, Subcategory } from '../../common/models/subcategory.model';
import { SubcategoryService } from '../../common/services/subcategory.service';
import { PagingHeaders } from '../../common/models/http.model';
import { ErrorService } from '../../common/services/error.service';
import { ToastrService } from 'ngx-toastr';

@NgComponent({
    selector: 'subcategory-sort',
    templateUrl: './subcategory.sort.component.html',
    standalone: false
})
export class SubcategorySortComponent implements OnInit {

    public headers: PagingHeaders = new PagingHeaders();
    private bodyElement: HTMLElement = document.body;
    public subcategories: Subcategory[];
    public categoryId: string;

    constructor(
        public modal: NgbActiveModal,
        private subcategoryService: SubcategoryService,
        private errorService: ErrorService,
        private toastr: ToastrService
    ) {
    }

    ngOnInit(): void {
        this.subcategoryService.search({ categoryId: this.categoryId, pageSize: 0, includeParents: true } as SubcategorySearchOptions)
            .subscribe({
                next: response => this.subcategories = response.subcategories,
                error: err => this.errorService.handleError(err, "Subcategories", "Load")
            });
    }

    dragStart(event: CdkDragStart) {
        this.bodyElement.classList.add('inheritCursors');
        this.bodyElement.style.cursor = 'grabbing';
    }

    drop(event: CdkDragDrop<Subcategory[]>) {
        this.bodyElement.classList.remove('inheritCursors');
        this.bodyElement.style.cursor = 'unset';
        moveItemInArray(this.subcategories, event.previousIndex, event.currentIndex);
    }

    close() {
        this.subcategoryService.sort(this.categoryId, this.subcategories.map(o => o.subcategoryId))
            .subscribe({
                next: () => {
                    this.modal.close();
                    this.toastr.success("The sort order has been updated", "Change Sort Order");
                },
                error: err => {
                    this.errorService.handleError(err, "Subcategories", "Sort");
                }
            });
    }

}

