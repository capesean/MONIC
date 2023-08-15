import { Component as NgComponent, OnInit, ViewChild, Output, EventEmitter, TemplateRef, Input } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { QuestionOptionGroupSearchOptions, QuestionOptionGroupSearchResponse, QuestionOptionGroup } from '../../common/models/questionoptiongroup.model';
import { QuestionOptionGroupService } from '../../common/services/questionoptiongroup.service';
import { PagingHeaders } from '../../common/models/http.model';
import { ErrorService } from '../../common/services/error.service';

@NgComponent({
    selector: 'question-option-group-modal',
    templateUrl: './questionoptiongroup.modal.component.html'
})
export class QuestionOptionGroupModalComponent implements OnInit {

    public modal: NgbModalRef;
    public selectedItems: QuestionOptionGroup[] = [];
    public headers: PagingHeaders = new PagingHeaders();
    public searchOptions: QuestionOptionGroupSearchOptions = new QuestionOptionGroupSearchOptions();
    public questionOptionGroups: QuestionOptionGroup[];
    public allSelected = false;

    @ViewChild('content') content: TemplateRef<unknown>;
    @Output() change: EventEmitter<QuestionOptionGroup> = new EventEmitter<QuestionOptionGroup>();
    @Output() changes: EventEmitter<QuestionOptionGroup[]> = new EventEmitter<QuestionOptionGroup[]>();
    @Input() canRemoveFilters = false;
    @Input() multiple = false;
    @Input() showAddNew = false;
    @Input() title = this.multiple ? "Select question option groups" : "Select a question option group";
    @Input() shared: boolean;

    constructor(
        private modalService: NgbModal,
        private questionOptionGroupService: QuestionOptionGroupService,
        private errorService: ErrorService
    ) {
    }

    ngOnInit(): void {
        this.searchOptions.includeParents = true;
    }

    open(): NgbModalRef {
        this.modal = this.modalService.open(this.content, { size: 'xl', centered: true, scrollable: true });
        this.runSearch();
        this.modal.result.then((questionOptionGroup: QuestionOptionGroup | QuestionOptionGroup[]) => {
            if (this.multiple) this.changes.emit(questionOptionGroup as QuestionOptionGroup[]);
            else this.change.emit(questionOptionGroup as QuestionOptionGroup);
        }, () => {
            // dismissed
        });
        return this.modal;
    }

    public runSearch(pageIndex = 0): Observable<QuestionOptionGroupSearchResponse> {

        this.searchOptions.pageIndex = pageIndex;
        this.searchOptions.shared = this.shared;
        this.allSelected = false;

        const observable = this.questionOptionGroupService
            .search(this.searchOptions);

        observable.subscribe({
            next: response => {
                this.questionOptionGroups = response.questionOptionGroups;
                this.headers = response.headers;
            },
            error: err => {

                this.errorService.handleError(err, "Question Option Groups", "Load");

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

    select(questionOptionGroup: QuestionOptionGroup) {
        if (this.multiple) {
            if (this.isSelected(questionOptionGroup)) {
                for (let i = 0; i < this.selectedItems.length; i++) {
                    if (this.selectedItems[i].questionOptionGroupId === questionOptionGroup.questionOptionGroupId) {
                        this.selectedItems.splice(i, 1);
                        break;
                    }
                }
            } else {
                this.selectedItems.push(questionOptionGroup);
            }
        } else {
            this.modal.close(questionOptionGroup);
        }
    }

    isSelected(questionOptionGroup: QuestionOptionGroup) {
        if (!this.multiple) return false;
        return this.selectedItems.filter(item => item.questionOptionGroupId === questionOptionGroup.questionOptionGroupId).length > 0;
    }

    toggleAll() {
        this.allSelected = !this.allSelected;
        this.questionOptionGroups.forEach(questionOptionGroup => {
            const isSelected = this.isSelected(questionOptionGroup);
			if (isSelected && !this.allSelected) {
                for (let i = 0; i < this.selectedItems.length; i++) {
                    if (this.selectedItems[i].questionOptionGroupId === questionOptionGroup.questionOptionGroupId) {
                        this.selectedItems.splice(i, 1);
                        break;
                    }
                }
            } else if (!isSelected && this.allSelected) {
                this.selectedItems.push(questionOptionGroup);
            }
        });
    }

    selectAll() {

        const oldPageSize = this.searchOptions.pageSize;
        this.searchOptions.pageSize = 0;
        this.searchOptions.pageIndex = 0;

        this.questionOptionGroupService.search(this.searchOptions)
            .subscribe({
                next: response => {
                    this.modal.close(response.questionOptionGroups);
                    this.questionOptionGroups = response.questionOptionGroups;
                    this.searchOptions.pageSize = oldPageSize;
                },
                error: err => {
                    this.errorService.handleError(err, "Question Option Groups", "Load");
                }
            });

    }

    addNew() {
        window.open("/questionoptiongroups/add", "_blank");
    }
}
