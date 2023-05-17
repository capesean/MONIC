import { Component as NgComponent, OnInit, ViewChild, Output, EventEmitter, TemplateRef, Input } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { AnswerSearchOptions, AnswerSearchResponse, Answer } from '../../common/models/answer.model';
import { AnswerService } from '../../common/services/answer.service';
import { PagingHeaders } from '../../common/models/http.model';
import { ErrorService } from '../../common/services/error.service';
import { Response } from '../../common/models/response.model';
import { Question } from '../../common/models/question.model';

@NgComponent({
    selector: 'answer-modal',
    templateUrl: './answer.modal.component.html'
})
export class AnswerModalComponent implements OnInit {

    public modal: NgbModalRef;
    public selectedItems: Answer[] = [];
    public headers: PagingHeaders = new PagingHeaders();
    public searchOptions: AnswerSearchOptions = new AnswerSearchOptions();
    public answers: Answer[];
    public allSelected = false;

    @ViewChild('content') content: TemplateRef<unknown>;
    @Output() change: EventEmitter<Answer> = new EventEmitter<Answer>();
    @Output() changes: EventEmitter<Answer[]> = new EventEmitter<Answer[]>();
    @Input() canRemoveFilters = false;
    @Input() multiple = false;
    @Input() showAddNew = false;
    @Input() title = this.multiple ? "Select answers" : "Select an answer";
    @Input() response: Response;
    @Input() question: Question;

    constructor(
        private modalService: NgbModal,
        private answerService: AnswerService,
        private errorService: ErrorService
    ) {
    }

    ngOnInit(): void {
        this.searchOptions.includeParents = true;
    }

    open(): NgbModalRef {
        this.searchOptions.responseId = this.response?.responseId;
        this.searchOptions.questionId = this.question?.questionId;
        this.modal = this.modalService.open(this.content, { size: 'xl', centered: true, scrollable: true });
        this.runSearch();
        this.modal.result.then((answer: Answer | Answer[]) => {
            if (this.multiple) this.changes.emit(answer as Answer[]);
            else this.change.emit(answer as Answer);
        }, () => {
            // dismissed
        });
        return this.modal;
    }

    public runSearch(pageIndex = 0): Observable<AnswerSearchResponse> {

        this.searchOptions.pageIndex = pageIndex;

        const observable = this.answerService
            .search(this.searchOptions);

        observable.subscribe({
            next: response => {
                this.answers = response.answers;
                this.headers = response.headers;
            },
            error: err => {

                this.errorService.handleError(err, "Answers", "Load");

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

    select(answer: Answer) {
        if (this.multiple) {
            if (this.isSelected(answer)) {
                for (let i = 0; i < this.selectedItems.length; i++) {
                    if (this.selectedItems[i].answerId === answer.answerId) {
                        this.selectedItems.splice(i, 1);
                        break;
                    }
                }
            } else {
                this.selectedItems.push(answer);
            }
        } else {
            this.modal.close(answer);
        }
    }

    isSelected(answer: Answer) {
        if (!this.multiple) return false;
        return this.selectedItems.filter(item => item.answerId === answer.answerId).length > 0;
    }

    toggleAll() {
        this.allSelected = !this.allSelected;
        this.answers.forEach(answer => {
            const isSelected = this.isSelected(answer);
			if (isSelected && !this.allSelected) {
                for (let i = 0; i < this.selectedItems.length; i++) {
                    if (this.selectedItems[i].answerId === answer.answerId) {
                        this.selectedItems.splice(i, 1);
                        break;
                    }
                }
            } else if (!isSelected && this.allSelected) {
                this.selectedItems.push(answer);
            }
        });
    }

    selectAll() {

        const oldPageSize = this.searchOptions.pageSize;
        this.searchOptions.pageSize = 0;
        this.searchOptions.pageIndex = 0;

        this.answerService.search(this.searchOptions)
            .subscribe({
                next: response => {
                    this.modal.close(response.answers);
                    this.answers = response.answers;
                    this.searchOptions.pageSize = oldPageSize;
                },
                error: err => {
                    this.errorService.handleError(err, "Answers", "Load");
                }
            });

    }

    addNew() {
        window.open("/answers/add", "_blank");
    }
}
