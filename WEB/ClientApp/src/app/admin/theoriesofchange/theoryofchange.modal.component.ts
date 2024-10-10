import { Component as NgComponent, OnInit, ViewChild, Output, EventEmitter, TemplateRef, Input } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { TheoryOfChangeSearchOptions, TheoryOfChangeSearchResponse, TheoryOfChange } from '../../common/models/theoryofchange.model';
import { TheoryOfChangeService } from '../../common/services/theoryofchange.service';
import { PagingHeaders } from '../../common/models/http.model';
import { ErrorService } from '../../common/services/error.service';

@NgComponent({
    selector: 'theory-of-change-modal',
    templateUrl: './theoryofchange.modal.component.html'
})
export class TheoryOfChangeModalComponent implements OnInit {

    public modal: NgbModalRef;
    public selectedItems: TheoryOfChange[] = [];
    public headers: PagingHeaders = new PagingHeaders();
    public searchOptions: TheoryOfChangeSearchOptions = new TheoryOfChangeSearchOptions();
    public theoriesOfChange: TheoryOfChange[];
    public allSelected = false;

    @ViewChild('content') content: TemplateRef<unknown>;
    @Output() change: EventEmitter<TheoryOfChange> = new EventEmitter<TheoryOfChange>();
    @Output() changes: EventEmitter<TheoryOfChange[]> = new EventEmitter<TheoryOfChange[]>();
    @Input() canRemoveFilters = false;
    @Input() multiple = false;
    @Input() showAddNew = false;
    @Input() showFilters = true;
    @Input() showFooter = true;
    @Input() resetOnOpen = false;
    @Input() title = this.multiple ? "Select theories of change" : "Select a theory of change";

    constructor(
        private modalService: NgbModal,
        private theoryOfChangeService: TheoryOfChangeService,
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
        this.modal.result.then((theoryOfChange: TheoryOfChange | TheoryOfChange[]) => {
            if (this.multiple) this.changes.emit(theoryOfChange as TheoryOfChange[]);
            else this.change.emit(theoryOfChange as TheoryOfChange);
        }, () => {
            // dismissed
        });
        return this.modal;
    }

    public runSearch(pageIndex = 0): Observable<TheoryOfChangeSearchResponse> {

        this.searchOptions.pageIndex = pageIndex;
        this.allSelected = false;

        const observable = this.theoryOfChangeService
            .search(this.searchOptions);

        observable.subscribe({
            next: response => {
                this.theoriesOfChange = response.theoriesOfChange;
                this.headers = response.headers;
            },
            error: err => {

                this.errorService.handleError(err, "Theories of Change", "Load");

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

    select(theoryOfChange: TheoryOfChange) {
        if (this.multiple) {
            if (this.isSelected(theoryOfChange)) {
                for (let i = 0; i < this.selectedItems.length; i++) {
                    if (this.selectedItems[i].theoryOfChangeId === theoryOfChange.theoryOfChangeId) {
                        this.selectedItems.splice(i, 1);
                        break;
                    }
                }
            } else {
                this.selectedItems.push(theoryOfChange);
            }
        } else {
            this.modal.close(theoryOfChange);
        }
    }

    isSelected(theoryOfChange: TheoryOfChange) {
        if (!this.multiple) return false;
        return this.selectedItems.filter(item => item.theoryOfChangeId === theoryOfChange.theoryOfChangeId).length > 0;
    }

    toggleAll() {
        this.allSelected = !this.allSelected;
        this.theoriesOfChange.forEach(theoryOfChange => {
            const isSelected = this.isSelected(theoryOfChange);
			if (isSelected && !this.allSelected) {
                for (let i = 0; i < this.selectedItems.length; i++) {
                    if (this.selectedItems[i].theoryOfChangeId === theoryOfChange.theoryOfChangeId) {
                        this.selectedItems.splice(i, 1);
                        break;
                    }
                }
            } else if (!isSelected && this.allSelected) {
                this.selectedItems.push(theoryOfChange);
            }
        });
    }

    selectAll() {

        const oldPageSize = this.searchOptions.pageSize;
        this.searchOptions.pageSize = 0;
        this.searchOptions.pageIndex = 0;

        this.theoryOfChangeService.search(this.searchOptions)
            .subscribe({
                next: response => {
                    this.modal.close(response.theoriesOfChange);
                    this.theoriesOfChange = response.theoriesOfChange;
                    this.searchOptions.pageSize = oldPageSize;
                },
                error: err => {
                    this.errorService.handleError(err, "Theories of Change", "Load");
                }
            });

    }

    addNew() {
        window.open("/theoriesofchange/add", "_blank");
    }
}
