import { Component as NgComponent, OnInit, ViewChild, Output, EventEmitter, TemplateRef, Input } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { OptionListSearchOptions, OptionListSearchResponse, OptionList } from '../../common/models/optionlist.model';
import { OptionListService } from '../../common/services/optionlist.service';
import { PagingHeaders } from '../../common/models/http.model';
import { ErrorService } from '../../common/services/error.service';

@NgComponent({
    selector: 'option-list-modal',
    templateUrl: './optionlist.modal.component.html',
    standalone: false
})
export class OptionListModalComponent implements OnInit {

    public modal: NgbModalRef;
    public headers: PagingHeaders = new PagingHeaders();
    public searchOptions: OptionListSearchOptions = new OptionListSearchOptions();
    public optionLists: OptionList[];
    public allSelected = false;

    @ViewChild('content') content: TemplateRef<unknown>;
    @Output() change: EventEmitter<OptionList> = new EventEmitter<OptionList>();
    @Output() changes: EventEmitter<OptionList[]> = new EventEmitter<OptionList[]>();
    @Input() selectedItems: OptionList[] = [];
    @Input() canRemoveFilters = false;
    @Input() multiple = false;
    @Input() showAddNew = false;
    @Input() showFilters = true;
    @Input() showFooter = true;
    @Input() resetOnOpen = false;
    @Input() title = this.multiple ? "Select option lists" : "Select an option list";

    constructor(
        private modalService: NgbModal,
        private optionListService: OptionListService,
        private errorService: ErrorService
    ) {
    }

    ngOnInit(): void {
        this.searchOptions.includeParents = true;
    }

    open(): NgbModalRef {
        if (this.resetOnOpen) this.selectedItems = [];
        this.modal = this.modalService.open(this.content, { size: 'xl', centered: true, scrollable: false });
        this.runSearch();
        this.modal.result.then((optionList: OptionList | OptionList[]) => {
            if (this.multiple) this.changes.emit(optionList as OptionList[]);
            else this.change.emit(optionList as OptionList);
        }, () => {
            // dismissed
        });
        return this.modal;
    }

    public runSearch(pageIndex = 0): Observable<OptionListSearchResponse> {

        this.searchOptions.pageIndex = pageIndex;
        this.allSelected = false;

        const observable = this.optionListService
            .search(this.searchOptions);

        observable.subscribe({
            next: response => {
                this.optionLists = response.optionLists;
                this.headers = response.headers;
            },
            error: err => {

                this.errorService.handleError(err, "Option Lists", "Load");

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

    select(optionList: OptionList) {
        if (this.multiple) {
            if (this.isSelected(optionList)) {
                for (let i = 0; i < this.selectedItems.length; i++) {
                    if (this.selectedItems[i].optionListId === optionList.optionListId) {
                        this.selectedItems.splice(i, 1);
                        break;
                    }
                }
            } else {
                this.selectedItems.push(optionList);
            }
        } else {
            this.modal.close(optionList);
        }
    }

    isSelected(optionList: OptionList) {
        if (!this.multiple) return false;
        return this.selectedItems.filter(item => item.optionListId === optionList.optionListId).length > 0;
    }

    toggleAll() {
        this.allSelected = !this.allSelected;
        this.optionLists.forEach(optionList => {
            const isSelected = this.isSelected(optionList);
			if (isSelected && !this.allSelected) {
                for (let i = 0; i < this.selectedItems.length; i++) {
                    if (this.selectedItems[i].optionListId === optionList.optionListId) {
                        this.selectedItems.splice(i, 1);
                        break;
                    }
                }
            } else if (!isSelected && this.allSelected) {
                this.selectedItems.push(optionList);
            }
        });
    }

    selectAll() {

        const oldPageSize = this.searchOptions.pageSize;
        this.searchOptions.pageSize = 0;
        this.searchOptions.pageIndex = 0;

        this.optionListService.search(this.searchOptions)
            .subscribe({
                next: response => {
                    this.modal.close(response.optionLists);
                    this.optionLists = response.optionLists;
                    this.searchOptions.pageSize = oldPageSize;
                },
                error: err => {
                    this.errorService.handleError(err, "Option Lists", "Load");
                }
            });

    }

    addNew() {
        window.open("/optionlists/add", "_blank");
    }
}
