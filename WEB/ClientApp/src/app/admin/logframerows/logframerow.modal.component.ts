import { Component as NgComponent, OnInit, ViewChild, Output, EventEmitter, TemplateRef, Input } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { LogFrameRowSearchOptions, LogFrameRowSearchResponse, LogFrameRow } from '../../common/models/logframerow.model';
import { LogFrameRowService } from '../../common/services/logframerow.service';
import { PagingHeaders } from '../../common/models/http.model';
import { ErrorService } from '../../common/services/error.service';
import { Enum, Enums } from '../../common/models/enums.model';
import { LogFrame } from '../../common/models/logframe.model';

@NgComponent({
    selector: 'log-frame-row-modal',
    templateUrl: './logframerow.modal.component.html'
})
export class LogFrameRowModalComponent implements OnInit {

    public modal: NgbModalRef;
    public selectedItems: LogFrameRow[] = [];
    public headers: PagingHeaders = new PagingHeaders();
    public searchOptions: LogFrameRowSearchOptions = new LogFrameRowSearchOptions();
    public logFrameRows: LogFrameRow[];
    public allSelected = false;
    logFrameRowTypes = Enums.LogFrameRowTypes;

    @ViewChild('content') content: TemplateRef<unknown>;
    @Output() change: EventEmitter<LogFrameRow> = new EventEmitter<LogFrameRow>();
    @Output() changes: EventEmitter<LogFrameRow[]> = new EventEmitter<LogFrameRow[]>();
    @Input() canRemoveFilters = false;
    @Input() multiple = false;
    @Input() showAddNew = false;
    @Input() showFooter = true;
    @Input() resetOnOpen = false;
    @Input() title = this.multiple ? "Select logframe rows" : "Select a logframe row";
    @Input() logFrame: LogFrame;
    @Input() rowType: Enum;

    constructor(
        private modalService: NgbModal,
        private logFrameRowService: LogFrameRowService,
        private errorService: ErrorService
    ) {
    }

    ngOnInit(): void {
        this.searchOptions.includeParents = true;
    }

    open(): NgbModalRef {
        if (this.resetOnOpen) this.selectedItems = [];
        this.searchOptions.logFrameId = this.logFrame?.logFrameId;
        this.searchOptions.rowType = this.rowType?.value;
        this.modal = this.modalService.open(this.content, { size: 'xl', centered: true, scrollable: true });
        this.runSearch();
        this.modal.result.then((logFrameRow: LogFrameRow | LogFrameRow[]) => {
            if (this.multiple) this.changes.emit(logFrameRow as LogFrameRow[]);
            else this.change.emit(logFrameRow as LogFrameRow);
        }, () => {
            // dismissed
        });
        return this.modal;
    }

    public runSearch(pageIndex = 0): Observable<LogFrameRowSearchResponse> {

        this.searchOptions.pageIndex = pageIndex;
        this.allSelected = false;

        const observable = this.logFrameRowService
            .search(this.searchOptions);

        observable.subscribe({
            next: response => {
                this.logFrameRows = response.logFrameRows;
                this.headers = response.headers;
            },
            error: err => {

                this.errorService.handleError(err, "LogFrame Rows", "Load");

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

    select(logFrameRow: LogFrameRow) {
        if (this.multiple) {
            if (this.isSelected(logFrameRow)) {
                for (let i = 0; i < this.selectedItems.length; i++) {
                    if (this.selectedItems[i].logFrameRowId === logFrameRow.logFrameRowId) {
                        this.selectedItems.splice(i, 1);
                        break;
                    }
                }
            } else {
                this.selectedItems.push(logFrameRow);
            }
        } else {
            this.modal.close(logFrameRow);
        }
    }

    isSelected(logFrameRow: LogFrameRow) {
        if (!this.multiple) return false;
        return this.selectedItems.filter(item => item.logFrameRowId === logFrameRow.logFrameRowId).length > 0;
    }

    toggleAll() {
        this.allSelected = !this.allSelected;
        this.logFrameRows.forEach(logFrameRow => {
            const isSelected = this.isSelected(logFrameRow);
			if (isSelected && !this.allSelected) {
                for (let i = 0; i < this.selectedItems.length; i++) {
                    if (this.selectedItems[i].logFrameRowId === logFrameRow.logFrameRowId) {
                        this.selectedItems.splice(i, 1);
                        break;
                    }
                }
            } else if (!isSelected && this.allSelected) {
                this.selectedItems.push(logFrameRow);
            }
        });
    }

    selectAll() {

        const oldPageSize = this.searchOptions.pageSize;
        this.searchOptions.pageSize = 0;
        this.searchOptions.pageIndex = 0;

        this.logFrameRowService.search(this.searchOptions)
            .subscribe({
                next: response => {
                    this.modal.close(response.logFrameRows);
                    this.logFrameRows = response.logFrameRows;
                    this.searchOptions.pageSize = oldPageSize;
                },
                error: err => {
                    this.errorService.handleError(err, "LogFrame Rows", "Load");
                }
            });

    }

    addNew() {
        window.open("/logframerows/add", "_blank");
    }
}
