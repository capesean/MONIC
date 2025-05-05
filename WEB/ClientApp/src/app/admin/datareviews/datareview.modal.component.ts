import { Component as NgComponent, OnInit, ViewChild, Output, EventEmitter, TemplateRef, Input } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { DataReviewSearchOptions, DataReviewSearchResponse, DataReview } from '../../common/models/datareview.model';
import { DataReviewService } from '../../common/services/datareview.service';
import { PagingHeaders } from '../../common/models/http.model';
import { ErrorService } from '../../common/services/error.service';
import { Enum, Enums } from '../../common/models/enums.model';
import { User } from '../../common/models/user.model';

@NgComponent({
    selector: 'data-review-modal',
    templateUrl: './datareview.modal.component.html',
    standalone: false
})
export class DataReviewModalComponent implements OnInit {

    public modal: NgbModalRef;
    public selectedItems: DataReview[] = [];
    public headers: PagingHeaders = new PagingHeaders();
    public searchOptions: DataReviewSearchOptions = new DataReviewSearchOptions();
    public dataReviews: DataReview[];
    public allSelected = false;
    reviewResults = Enums.ReviewResults;
    reviewStatuses = Enums.ReviewStatuses;

    @ViewChild('content') content: TemplateRef<unknown>;
    @Output() change: EventEmitter<DataReview> = new EventEmitter<DataReview>();
    @Output() changes: EventEmitter<DataReview[]> = new EventEmitter<DataReview[]>();
    @Input() canRemoveFilters = false;
    @Input() multiple = false;
    @Input() showAddNew = false;
    @Input() showFilters = true;
    @Input() showFooter = true;
    @Input() resetOnOpen = false;
    @Input() title = this.multiple ? "Select data reviews" : "Select a data review";
    @Input() user: User;
    @Input() reviewStatus: Enum;

    constructor(
        private modalService: NgbModal,
        private dataReviewService: DataReviewService,
        private errorService: ErrorService
    ) {
    }

    ngOnInit(): void {
        this.searchOptions.includeParents = true;
    }

    open(): NgbModalRef {
        if (this.resetOnOpen) this.selectedItems = [];
        this.searchOptions.userId = this.user?.id;
        this.searchOptions.reviewStatus = this.reviewStatus?.value;
        this.modal = this.modalService.open(this.content, { size: 'xl', centered: true, scrollable: false });
        this.runSearch();
        this.modal.result.then((dataReview: DataReview | DataReview[]) => {
            if (this.multiple) this.changes.emit(dataReview as DataReview[]);
            else this.change.emit(dataReview as DataReview);
        }, () => {
            // dismissed
        });
        return this.modal;
    }

    public runSearch(pageIndex = 0): Observable<DataReviewSearchResponse> {

        this.searchOptions.pageIndex = pageIndex;
        this.allSelected = false;

        const observable = this.dataReviewService
            .search(this.searchOptions);

        observable.subscribe({
            next: response => {
                this.dataReviews = response.dataReviews;
                this.headers = response.headers;
            },
            error: err => {

                this.errorService.handleError(err, "Data Reviews", "Load");

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

    select(dataReview: DataReview) {
        if (this.multiple) {
            if (this.isSelected(dataReview)) {
                for (let i = 0; i < this.selectedItems.length; i++) {
                    if (this.selectedItems[i].dataReviewId === dataReview.dataReviewId) {
                        this.selectedItems.splice(i, 1);
                        break;
                    }
                }
            } else {
                this.selectedItems.push(dataReview);
            }
        } else {
            this.modal.close(dataReview);
        }
    }

    isSelected(dataReview: DataReview) {
        if (!this.multiple) return false;
        return this.selectedItems.filter(item => item.dataReviewId === dataReview.dataReviewId).length > 0;
    }

    toggleAll() {
        this.allSelected = !this.allSelected;
        this.dataReviews.forEach(dataReview => {
            const isSelected = this.isSelected(dataReview);
			if (isSelected && !this.allSelected) {
                for (let i = 0; i < this.selectedItems.length; i++) {
                    if (this.selectedItems[i].dataReviewId === dataReview.dataReviewId) {
                        this.selectedItems.splice(i, 1);
                        break;
                    }
                }
            } else if (!isSelected && this.allSelected) {
                this.selectedItems.push(dataReview);
            }
        });
    }

    selectAll() {

        const oldPageSize = this.searchOptions.pageSize;
        this.searchOptions.pageSize = 0;
        this.searchOptions.pageIndex = 0;

        this.dataReviewService.search(this.searchOptions)
            .subscribe({
                next: response => {
                    this.modal.close(response.dataReviews);
                    this.dataReviews = response.dataReviews;
                    this.searchOptions.pageSize = oldPageSize;
                },
                error: err => {
                    this.errorService.handleError(err, "Data Reviews", "Load");
                }
            });

    }

    addNew() {
        window.open("/datareviews/add", "_blank");
    }
}
