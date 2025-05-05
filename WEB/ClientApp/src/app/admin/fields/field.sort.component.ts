import { Component as NgComponent, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CdkDragDrop, CdkDragStart, moveItemInArray } from '@angular/cdk/drag-drop';
import { FieldSearchOptions, FieldSearchResponse, Field } from '../../common/models/field.model';
import { FieldService } from '../../common/services/field.service';
import { PagingHeaders } from '../../common/models/http.model';
import { ErrorService } from '../../common/services/error.service';
import { ToastrService } from 'ngx-toastr';
import { Enum, Enums } from '../../common/models/enums.model';

@NgComponent({
    selector: 'field-sort',
    templateUrl: './field.sort.component.html',
    standalone: false
})
export class FieldSortComponent implements OnInit {

    public headers: PagingHeaders = new PagingHeaders();
    private bodyElement: HTMLElement = document.body;
    public fields: Field[];
    public sizes: Enum[] = Enums.Sizes;
    public fieldTypes: Enum[] = Enums.FieldTypes;

    constructor(
        public modal: NgbActiveModal,
        private fieldService: FieldService,
        private errorService: ErrorService,
        private toastr: ToastrService
    ) {
    }

    ngOnInit(): void {
        this.fieldService.search({ pageSize: 0, includeParents: true } as FieldSearchOptions)
            .subscribe({
                next: response => this.fields = response.fields,
                error: err => this.errorService.handleError(err, "Fields", "Load")
            });
    }

    dragStart(event: CdkDragStart) {
        this.bodyElement.classList.add('inheritCursors');
        this.bodyElement.style.cursor = 'grabbing';
    }

    drop(event: CdkDragDrop<Field[]>) {
        this.bodyElement.classList.remove('inheritCursors');
        this.bodyElement.style.cursor = 'unset';
        moveItemInArray(this.fields, event.previousIndex, event.currentIndex);
    }

    close() {
        this.fieldService.sort(this.fields.map(o => o.fieldId))
            .subscribe({
                next: () => {
                    this.modal.close();
                    this.toastr.success("The sort order has been updated", "Change Sort Order");
                },
                error: err => {
                    this.errorService.handleError(err, "Fields", "Sort");
                }
            });
    }

}

