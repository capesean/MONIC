import { Component as NgComponent, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CdkDragDrop, CdkDragStart, moveItemInArray } from '@angular/cdk/drag-drop';
import { QuestionSearchOptions, QuestionSearchResponse, Question } from '../../common/models/question.model';
import { QuestionService } from '../../common/services/question.service';
import { PagingHeaders } from '../../common/models/http.model';
import { ErrorService } from '../../common/services/error.service';
import { ToastrService } from 'ngx-toastr';
import { Enum, Enums } from '../../common/models/enums.model';

@NgComponent({
    selector: 'question-sort',
    templateUrl: './question.sort.component.html'
})
export class QuestionSortComponent implements OnInit {

    public headers: PagingHeaders = new PagingHeaders();
    private bodyElement: HTMLElement = document.body;
    public questions: Question[];
    public questionTypes: Enum[] = Enums.QuestionTypes;
    public sectionId: string;

    constructor(
        public modal: NgbActiveModal,
        private questionService: QuestionService,
        private errorService: ErrorService,
        private toastr: ToastrService
    ) {
    }

    ngOnInit(): void {
        this.questionService.search({ sectionId: this.sectionId, pageSize: 0, includeParents: true } as QuestionSearchOptions)
            .subscribe({
                next: response => this.questions = response.questions,
                error: err => this.errorService.handleError(err, "Questions", "Load")
            });
    }

    dragStart(event: CdkDragStart) {
        this.bodyElement.classList.add('inheritCursors');
        this.bodyElement.style.cursor = 'grabbing';
    }

    drop(event: CdkDragDrop<Question[]>) {
        this.bodyElement.classList.remove('inheritCursors');
        this.bodyElement.style.cursor = 'unset';
        moveItemInArray(this.questions, event.previousIndex, event.currentIndex);
    }

    close() {
        this.questionService.sort(this.sectionId, this.questions.map(o => o.questionId))
            .subscribe({
                next: () => {
                    this.modal.close();
                    this.toastr.success("The sort order has been updated", "Change Sort Order");
                },
                error: err => {
                    this.errorService.handleError(err, "Questions", "Sort");
                }
            });
    }

}

