import { Component as NgComponent, OnInit, ViewChild, Output, EventEmitter, TemplateRef, Input } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { QuestionSearchOptions, QuestionSearchResponse, Question } from '../../common/models/question.model';
import { QuestionService } from '../../common/services/question.service';
import { PagingHeaders } from '../../common/models/http.model';
import { ErrorService } from '../../common/services/error.service';
import { Enum, Enums } from '../../common/models/enums.model';
import { Section } from '../../common/models/section.model';
import { QuestionOptionGroup } from '../../common/models/questionoptiongroup.model';
import { Questionnaire } from '../../common/models/questionnaire.model';

@NgComponent({
    selector: 'question-modal',
    templateUrl: './question.modal.component.html'
})
export class QuestionModalComponent implements OnInit {

    public modal: NgbModalRef;
    public selectedItems: Question[] = [];
    public headers: PagingHeaders = new PagingHeaders();
    public searchOptions: QuestionSearchOptions = new QuestionSearchOptions();
    public questions: Question[];
    public allSelected = false;
    questionTypes = Enums.QuestionTypes;

    @ViewChild('content') content: TemplateRef<unknown>;
    @Output() change: EventEmitter<Question> = new EventEmitter<Question>();
    @Output() changes: EventEmitter<Question[]> = new EventEmitter<Question[]>();
    @Input() canRemoveFilters = false;
    @Input() multiple = false;
    @Input() showAddNew = false;
    @Input() showFooter = true;
    @Input() resetOnOpen = false;
    @Input() title = this.multiple ? "Select questions" : "Select a question";
    @Input() questionnaire: Questionnaire;
    @Input() section: Section;
    @Input() questionType: Enum;
    @Input() questionOptionGroup: QuestionOptionGroup;

    constructor(
        private modalService: NgbModal,
        private questionService: QuestionService,
        private errorService: ErrorService
    ) {
    }

    ngOnInit(): void {
        this.searchOptions.includeParents = true;
    }

    open(): NgbModalRef {
        this.searchOptions.questionnaireId = this.questionnaire?.questionnaireId;
        if (this.resetOnOpen) this.selectedItems = [];
        this.searchOptions.sectionId = this.section?.sectionId;
        this.searchOptions.questionType = this.questionType?.value;
        this.searchOptions.questionOptionGroupId = this.questionOptionGroup?.questionOptionGroupId;
        this.modal = this.modalService.open(this.content, { size: 'xl', centered: true, scrollable: true });
        this.runSearch();
        this.modal.result.then((question: Question | Question[]) => {
            if (this.multiple) this.changes.emit(question as Question[]);
            else this.change.emit(question as Question);
        }, () => {
            // dismissed
        });
        return this.modal;
    }

    public runSearch(pageIndex = 0): Observable<QuestionSearchResponse> {

        this.searchOptions.pageIndex = pageIndex;
        this.allSelected = false;

        const observable = this.questionService
            .search(this.searchOptions);

        observable.subscribe({
            next: response => {
                this.questions = response.questions;
                this.headers = response.headers;
            },
            error: err => {

                this.errorService.handleError(err, "Questions", "Load");

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

    select(question: Question) {
        if (this.multiple) {
            if (this.isSelected(question)) {
                for (let i = 0; i < this.selectedItems.length; i++) {
                    if (this.selectedItems[i].questionId === question.questionId) {
                        this.selectedItems.splice(i, 1);
                        break;
                    }
                }
            } else {
                this.selectedItems.push(question);
            }
        } else {
            this.modal.close(question);
        }
    }

    isSelected(question: Question) {
        if (!this.multiple) return false;
        return this.selectedItems.filter(item => item.questionId === question.questionId).length > 0;
    }

    toggleAll() {
        this.allSelected = !this.allSelected;
        this.questions.forEach(question => {
            const isSelected = this.isSelected(question);
			if (isSelected && !this.allSelected) {
                for (let i = 0; i < this.selectedItems.length; i++) {
                    if (this.selectedItems[i].questionId === question.questionId) {
                        this.selectedItems.splice(i, 1);
                        break;
                    }
                }
            } else if (!isSelected && this.allSelected) {
                this.selectedItems.push(question);
            }
        });
    }

    selectAll() {

        const oldPageSize = this.searchOptions.pageSize;
        this.searchOptions.pageSize = 0;
        this.searchOptions.pageIndex = 0;

        this.questionService.search(this.searchOptions)
            .subscribe({
                next: response => {
                    this.modal.close(response.questions);
                    this.questions = response.questions;
                    this.searchOptions.pageSize = oldPageSize;
                },
                error: err => {
                    this.errorService.handleError(err, "Questions", "Load");
                }
            });

    }

    addNew() {
        window.open("/questions/add", "_blank");
    }
}
