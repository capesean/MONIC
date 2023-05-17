import { Component as NgComponent, OnInit, ViewChild, Output, EventEmitter, TemplateRef, Input } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { FieldSearchOptions, FieldSearchResponse, Field } from '../../common/models/field.model';
import { FieldService } from '../../common/services/field.service';
import { PagingHeaders } from '../../common/models/http.model';
import { ErrorService } from '../../common/services/error.service';
import { Enum, Enums } from '../../common/models/enums.model';
import { Group } from '../../common/models/group.model';

@NgComponent({
    selector: 'field-modal',
    templateUrl: './field.modal.component.html'
})
export class FieldModalComponent implements OnInit {

    public modal: NgbModalRef;
    public selectedItems: Field[] = [];
    public headers: PagingHeaders = new PagingHeaders();
    public searchOptions: FieldSearchOptions = new FieldSearchOptions();
    public fields: Field[];
    public allSelected = false;
    fieldTypes = Enums.FieldTypes;
    sizes = Enums.Sizes;

    @ViewChild('content') content: TemplateRef<unknown>;
    @Output() change: EventEmitter<Field> = new EventEmitter<Field>();
    @Output() changes: EventEmitter<Field[]> = new EventEmitter<Field[]>();
    @Input() canRemoveFilters = false;
    @Input() multiple = false;
    @Input() showAddNew = false;
    @Input() title = this.multiple ? "Select fields" : "Select a field";
    @Input() fieldType: Enum;
    @Input() group: Group;

    constructor(
        private modalService: NgbModal,
        private fieldService: FieldService,
        private errorService: ErrorService
    ) {
    }

    ngOnInit(): void {
        this.searchOptions.includeParents = true;
    }

    open(): NgbModalRef {
        this.searchOptions.fieldType = this.fieldType?.value;
        this.searchOptions.groupId = this.group?.groupId;
        this.modal = this.modalService.open(this.content, { size: 'xl', centered: true, scrollable: true });
        this.runSearch();
        this.modal.result.then((field: Field | Field[]) => {
            if (this.multiple) this.changes.emit(field as Field[]);
            else this.change.emit(field as Field);
        }, () => {
            // dismissed
        });
        return this.modal;
    }

    public runSearch(pageIndex = 0): Observable<FieldSearchResponse> {

        this.searchOptions.pageIndex = pageIndex;

        const observable = this.fieldService
            .search(this.searchOptions);

        observable.subscribe({
            next: response => {
                this.fields = response.fields;
                this.headers = response.headers;
            },
            error: err => {

                this.errorService.handleError(err, "Fields", "Load");

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

    select(field: Field) {
        if (this.multiple) {
            if (this.isSelected(field)) {
                for (let i = 0; i < this.selectedItems.length; i++) {
                    if (this.selectedItems[i].fieldId === field.fieldId) {
                        this.selectedItems.splice(i, 1);
                        break;
                    }
                }
            } else {
                this.selectedItems.push(field);
            }
        } else {
            this.modal.close(field);
        }
    }

    isSelected(field: Field) {
        if (!this.multiple) return false;
        return this.selectedItems.filter(item => item.fieldId === field.fieldId).length > 0;
    }

    toggleAll() {
        this.allSelected = !this.allSelected;
        this.fields.forEach(field => {
            const isSelected = this.isSelected(field);
			if (isSelected && !this.allSelected) {
                for (let i = 0; i < this.selectedItems.length; i++) {
                    if (this.selectedItems[i].fieldId === field.fieldId) {
                        this.selectedItems.splice(i, 1);
                        break;
                    }
                }
            } else if (!isSelected && this.allSelected) {
                this.selectedItems.push(field);
            }
        });
    }

    selectAll() {

        const oldPageSize = this.searchOptions.pageSize;
        this.searchOptions.pageSize = 0;
        this.searchOptions.pageIndex = 0;

        this.fieldService.search(this.searchOptions)
            .subscribe({
                next: response => {
                    this.modal.close(response.fields);
                    this.fields = response.fields;
                    this.searchOptions.pageSize = oldPageSize;
                },
                error: err => {
                    this.errorService.handleError(err, "Fields", "Load");
                }
            });

    }

    addNew() {
        window.open("/fields/add", "_blank");
    }
}
