import { Component as NgComponent, OnInit, ViewChild, Output, EventEmitter, TemplateRef, Input } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { QuestionOptionSearchOptions, QuestionOptionSearchResponse, QuestionOption } from '../../common/models/questionoption.model';
import { QuestionOptionService } from '../../common/services/questionoption.service';
import { PagingHeaders } from '../../common/models/http.model';
import { ErrorService } from '../../common/services/error.service';
import { QuestionOptionGroup } from '../../common/models/questionoptiongroup.model';

@NgComponent({
    selector: 'question-option-modal',
    templateUrl: './questionoption.modal.component.html'
})
export class QuestionOptionModalComponent implements OnInit {

    public modal: NgbModalRef;
    public selectedItems: QuestionOption[] = [];
    public headers: PagingHeaders = new PagingHeaders();
    public searchOptions: QuestionOptionSearchOptions = new QuestionOptionSearchOptions();
    public questionOptions: QuestionOption[];
    public allSelected = false;

    @ViewChild('content') content: TemplateRef<unknown>;
    @Output() change: EventEmitter<QuestionOption> = new EventEmitter<QuestionOption>();
    @Output() changes: EventEmitter<QuestionOption[]> = new EventEmitter<QuestionOption[]>();
    @Input() canRemoveFilters = false;
    @Input() multiple = false;
    @Input() showAddNew = false;
    @Input() showFilters = true;
    @Input() showFooter = true;
    @Input() resetOnOpen = false;
    @Input() title = this.multiple ? "Select options" : "Select a option";
    @Input() questionOptionGroup: QuestionOptionGroup;

    constructor(
        private modalService: NgbModal,
        private questionOptionService: QuestionOptionService,
        private errorService: ErrorService
    ) {
    }

    ngOnInit(): void {
        this.searchOptions.includeParents = true;
    }

    open(): NgbModalRef {
        if (this.resetOnOpen) this.selectedItems = [];
        this.searchOptions.questionOptionGroupId = this.questionOptionGroup?.questionOptionGroupId;
        this.modal = this.modalService.open(this.content, { size: 'xl', centered: true, scrollable: true });
        this.runSearch();
        this.modal.result.then((questionOption: QuestionOption | QuestionOption[]) => {
            if (this.multiple) this.changes.emit(questionOption as QuestionOption[]);
            else this.change.emit(questionOption as QuestionOption);
        }, () => {
            // dismissed
        });
        return this.modal;
    }

    public runSearch(pageIndex = 0): Observable<QuestionOptionSearchResponse> {

        this.searchOptions.pageIndex = pageIndex;
        this.allSelected = false;

        const observable = this.questionOptionService
            .search(this.searchOptions);

        observable.subscribe({
            next: response => {
                this.questionOptions = response.questionOptions;
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

    select(questionOption: QuestionOption) {
        if (this.multiple) {
            if (this.isSelected(questionOption)) {
                for (let i = 0; i < this.selectedItems.length; i++) {
                    if (this.selectedItems[i].questionOptionId === questionOption.questionOptionId) {
                        this.selectedItems.splice(i, 1);
                        break;
                    }
                }
            } else {
                this.selectedItems.push(questionOption);
            }
        } else {
            this.modal.close(questionOption);
        }
    }

    isSelected(questionOption: QuestionOption) {
        if (!this.multiple) return false;
        return this.selectedItems.filter(item => item.questionOptionId === questionOption.questionOptionId).length > 0;
    }

    toggleAll() {
        this.allSelected = !this.allSelected;
        this.questionOptions.forEach(questionOption => {
            const isSelected = this.isSelected(questionOption);
			if (isSelected && !this.allSelected) {
                for (let i = 0; i < this.selectedItems.length; i++) {
                    if (this.selectedItems[i].questionOptionId === questionOption.questionOptionId) {
                        this.selectedItems.splice(i, 1);
                        break;
                    }
                }
            } else if (!isSelected && this.allSelected) {
                this.selectedItems.push(questionOption);
            }
        });
    }

    selectAll() {

        const oldPageSize = this.searchOptions.pageSize;
        this.searchOptions.pageSize = 0;
        this.searchOptions.pageIndex = 0;

        this.questionOptionService.search(this.searchOptions)
            .subscribe({
                next: response => {
                    this.modal.close(response.questionOptions);
                    this.questionOptions = response.questionOptions;
                    this.searchOptions.pageSize = oldPageSize;
                },
                error: err => {
                    this.errorService.handleError(err, "Options", "Load");
                }
            });

    }

    addNew() {
        window.open("/questionoptions/add", "_blank");
    }
}
