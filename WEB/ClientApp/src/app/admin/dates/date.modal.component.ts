import { Component as NgComponent, OnInit, ViewChild, Output, EventEmitter, TemplateRef, Input } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { DateSearchOptions, DateSearchResponse, Date } from '../../common/models/date.model';
import { DateService } from '../../common/services/date.service';
import { PagingHeaders } from '../../common/models/http.model';
import { ErrorService } from '../../common/services/error.service';
import { Enum, Enums } from '../../common/models/enums.model';

@NgComponent({
    selector: 'date-modal',
    templateUrl: './date.modal.component.html'
})
export class DateModalComponent implements OnInit {

    public modal: NgbModalRef;
    public selectedItems: Date[] = [];
    public headers: PagingHeaders = new PagingHeaders();
    public searchOptions: DateSearchOptions = new DateSearchOptions();
    public dates: Date[];
    public allSelected = false;
    dateTypes = Enums.DateTypes;

    @ViewChild('content') content: TemplateRef<unknown>;
    @Output() change: EventEmitter<Date> = new EventEmitter<Date>();
    @Output() changes: EventEmitter<Date[]> = new EventEmitter<Date[]>();
    @Input() canRemoveFilters = false;
    @Input() multiple = false;
    @Input() showAddNew = false;
    @Input() title = this.multiple ? "Select dates" : "Select a date";
    @Input() dateType: Enum;
    @Input() quarter: Date;
    @Input() year: Date;
    @Input() isOpen: boolean;
    @Input() hasOpened: boolean;

    constructor(
        private modalService: NgbModal,
        private dateService: DateService,
        private errorService: ErrorService
    ) {
    }

    ngOnInit(): void {
        this.searchOptions.includeParents = true;
    }

    open(): NgbModalRef {
        this.searchOptions.dateType = this.dateType?.value;
        this.searchOptions.quarterId = this.quarter?.dateId;
        this.searchOptions.yearId = this.year?.dateId;
        if (this.isOpen != null) this.searchOptions.isOpen = this.isOpen;
        if (this.hasOpened != null) this.searchOptions.hasOpened = this.hasOpened;
        this.modal = this.modalService.open(this.content, { size: 'xl', centered: true, scrollable: true });
        this.runSearch();
        this.modal.result.then((date: Date | Date[]) => {
            if (this.multiple) this.changes.emit(date as Date[]);
            else this.change.emit(date as Date);
        }, () => {
            // dismissed
        });
        return this.modal;
    }

    public runSearch(pageIndex = 0): Observable<DateSearchResponse> {

        this.searchOptions.pageIndex = pageIndex;
        this.allSelected = false;

        const observable = this.dateService
            .search(this.searchOptions);

        observable.subscribe({
            next: response => {
                this.dates = response.dates;
                this.headers = response.headers;
            },
            error: err => {

                this.errorService.handleError(err, "Dates", "Load");

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

    select(date: Date) {
        if (this.multiple) {
            if (this.isSelected(date)) {
                for (let i = 0; i < this.selectedItems.length; i++) {
                    if (this.selectedItems[i].dateId === date.dateId) {
                        this.selectedItems.splice(i, 1);
                        break;
                    }
                }
            } else {
                this.selectedItems.push(date);
            }
        } else {
            this.modal.close(date);
        }
    }

    isSelected(date: Date) {
        if (!this.multiple) return false;
        return this.selectedItems.filter(item => item.dateId === date.dateId).length > 0;
    }

    toggleAll() {
        this.allSelected = !this.allSelected;
        this.dates.forEach(date => {
            const isSelected = this.isSelected(date);
			if (isSelected && !this.allSelected) {
                for (let i = 0; i < this.selectedItems.length; i++) {
                    if (this.selectedItems[i].dateId === date.dateId) {
                        this.selectedItems.splice(i, 1);
                        break;
                    }
                }
            } else if (!isSelected && this.allSelected) {
                this.selectedItems.push(date);
            }
        });
    }

    selectAll() {

        const oldPageSize = this.searchOptions.pageSize;
        this.searchOptions.pageSize = 0;
        this.searchOptions.pageIndex = 0;

        this.dateService.search(this.searchOptions)
            .subscribe({
                next: response => {
                    this.modal.close(response.dates);
                    this.dates = response.dates;
                    this.searchOptions.pageSize = oldPageSize;
                },
                error: err => {
                    this.errorService.handleError(err, "Dates", "Load");
                }
            });

    }

    addNew() {
        window.open("/dates/add", "_blank");
    }
}
