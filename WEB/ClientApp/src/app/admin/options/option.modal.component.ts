import { Component as NgComponent, OnInit, ViewChild, Output, EventEmitter, TemplateRef, Input } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { OptionSearchOptions, OptionSearchResponse, Option } from '../../common/models/option.model';
import { OptionService } from '../../common/services/option.service';
import { PagingHeaders } from '../../common/models/http.model';
import { ErrorService } from '../../common/services/error.service';
import { Field } from '../../common/models/field.model';

@NgComponent({
    selector: 'option-modal',
    templateUrl: './option.modal.component.html',
    standalone: false
})
export class OptionModalComponent implements OnInit {

    public modal: NgbModalRef;
    public selectedItems: Option[] = [];
    public headers: PagingHeaders = new PagingHeaders();
    public searchOptions: OptionSearchOptions = new OptionSearchOptions();
    public options: Option[];
    public allSelected = false;

    @ViewChild('content') content: TemplateRef<unknown>;
    @Output() change: EventEmitter<Option> = new EventEmitter<Option>();
    @Output() changes: EventEmitter<Option[]> = new EventEmitter<Option[]>();
    @Input() canRemoveFilters = false;
    @Input() multiple = false;
    @Input() showAddNew = false;
    @Input() showFilters = true;
    @Input() showFooter = true;
    @Input() resetOnOpen = false;
    @Input() title = this.multiple ? "Select options" : "Select an option";
    @Input() field: Field;

    constructor(
        private modalService: NgbModal,
        private optionService: OptionService,
        private errorService: ErrorService
    ) {
    }

    ngOnInit(): void {
        this.searchOptions.includeParents = true;
    }

    open(): NgbModalRef {
        if (this.resetOnOpen) this.selectedItems = [];
        this.searchOptions.fieldId = this.field?.fieldId;
        this.modal = this.modalService.open(this.content, { size: 'xl', centered: true, scrollable: false });
        this.runSearch();
        this.modal.result.then((option: Option | Option[]) => {
            if (this.multiple) this.changes.emit(option as Option[]);
            else this.change.emit(option as Option);
        }, () => {
            // dismissed
        });
        return this.modal;
    }

    public runSearch(pageIndex = 0): Observable<OptionSearchResponse> {

        this.searchOptions.pageIndex = pageIndex;
        this.allSelected = false;

        const observable = this.optionService
            .search(this.searchOptions);

        observable.subscribe({
            next: response => {
                this.options = response.options;
                this.headers = response.headers;
            },
            error: err => {

                this.errorService.handleError(err, "Options", "Load");

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

    select(option: Option) {
        if (this.multiple) {
            if (this.isSelected(option)) {
                for (let i = 0; i < this.selectedItems.length; i++) {
                    if (this.selectedItems[i].optionId === option.optionId) {
                        this.selectedItems.splice(i, 1);
                        break;
                    }
                }
            } else {
                this.selectedItems.push(option);
            }
        } else {
            this.modal.close(option);
        }
    }

    isSelected(option: Option) {
        if (!this.multiple) return false;
        return this.selectedItems.filter(item => item.optionId === option.optionId).length > 0;
    }

    toggleAll() {
        this.allSelected = !this.allSelected;
        this.options.forEach(option => {
            const isSelected = this.isSelected(option);
			if (isSelected && !this.allSelected) {
                for (let i = 0; i < this.selectedItems.length; i++) {
                    if (this.selectedItems[i].optionId === option.optionId) {
                        this.selectedItems.splice(i, 1);
                        break;
                    }
                }
            } else if (!isSelected && this.allSelected) {
                this.selectedItems.push(option);
            }
        });
    }

    selectAll() {

        const oldPageSize = this.searchOptions.pageSize;
        this.searchOptions.pageSize = 0;
        this.searchOptions.pageIndex = 0;

        this.optionService.search(this.searchOptions)
            .subscribe({
                next: response => {
                    this.modal.close(response.options);
                    this.options = response.options;
                    this.searchOptions.pageSize = oldPageSize;
                },
                error: err => {
                    this.errorService.handleError(err, "Options", "Load");
                }
            });

    }

    addNew() {
        window.open("/options/add", "_blank");
    }
}
