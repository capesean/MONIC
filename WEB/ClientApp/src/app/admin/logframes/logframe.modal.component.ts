import { Component as NgComponent, OnInit, ViewChild, Output, EventEmitter, TemplateRef, Input } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { LogFrameSearchOptions, LogFrameSearchResponse, LogFrame } from '../../common/models/logframe.model';
import { LogFrameService } from '../../common/services/logframe.service';
import { PagingHeaders } from '../../common/models/http.model';
import { ErrorService } from '../../common/services/error.service';

@NgComponent({
    selector: 'log-frame-modal',
    templateUrl: './logframe.modal.component.html'
})
export class LogFrameModalComponent implements OnInit {

    public modal: NgbModalRef;
    public selectedItems: LogFrame[] = [];
    public headers: PagingHeaders = new PagingHeaders();
    public searchOptions: LogFrameSearchOptions = new LogFrameSearchOptions();
    public logFrames: LogFrame[];
    public allSelected = false;

    @ViewChild('content') content: TemplateRef<unknown>;
    @Output() change: EventEmitter<LogFrame> = new EventEmitter<LogFrame>();
    @Output() changes: EventEmitter<LogFrame[]> = new EventEmitter<LogFrame[]>();
    @Input() canRemoveFilters = false;
    @Input() multiple = false;
    @Input() showAddNew = false;
    @Input() showFooter = true;
    @Input() resetOnOpen = false;
    @Input() title = this.multiple ? "Select logical frameworks" : "Select a logical framework";

    constructor(
        private modalService: NgbModal,
        private logFrameService: LogFrameService,
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
        this.modal.result.then((logFrame: LogFrame | LogFrame[]) => {
            if (this.multiple) this.changes.emit(logFrame as LogFrame[]);
            else this.change.emit(logFrame as LogFrame);
        }, () => {
            // dismissed
        });
        return this.modal;
    }

    public runSearch(pageIndex = 0): Observable<LogFrameSearchResponse> {

        this.searchOptions.pageIndex = pageIndex;
        this.allSelected = false;

        const observable = this.logFrameService
            .search(this.searchOptions);

        observable.subscribe({
            next: response => {
                this.logFrames = response.logFrames;
                this.headers = response.headers;
            },
            error: err => {

                this.errorService.handleError(err, "Logical Frameworks", "Load");

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

    select(logFrame: LogFrame) {
        if (this.multiple) {
            if (this.isSelected(logFrame)) {
                for (let i = 0; i < this.selectedItems.length; i++) {
                    if (this.selectedItems[i].logFrameId === logFrame.logFrameId) {
                        this.selectedItems.splice(i, 1);
                        break;
                    }
                }
            } else {
                this.selectedItems.push(logFrame);
            }
        } else {
            this.modal.close(logFrame);
        }
    }

    isSelected(logFrame: LogFrame) {
        if (!this.multiple) return false;
        return this.selectedItems.filter(item => item.logFrameId === logFrame.logFrameId).length > 0;
    }

    toggleAll() {
        this.allSelected = !this.allSelected;
        this.logFrames.forEach(logFrame => {
            const isSelected = this.isSelected(logFrame);
			if (isSelected && !this.allSelected) {
                for (let i = 0; i < this.selectedItems.length; i++) {
                    if (this.selectedItems[i].logFrameId === logFrame.logFrameId) {
                        this.selectedItems.splice(i, 1);
                        break;
                    }
                }
            } else if (!isSelected && this.allSelected) {
                this.selectedItems.push(logFrame);
            }
        });
    }

    selectAll() {

        const oldPageSize = this.searchOptions.pageSize;
        this.searchOptions.pageSize = 0;
        this.searchOptions.pageIndex = 0;

        this.logFrameService.search(this.searchOptions)
            .subscribe({
                next: response => {
                    this.modal.close(response.logFrames);
                    this.logFrames = response.logFrames;
                    this.searchOptions.pageSize = oldPageSize;
                },
                error: err => {
                    this.errorService.handleError(err, "Logical Frameworks", "Load");
                }
            });

    }

    addNew() {
        window.open("/logframes/add", "_blank");
    }
}
