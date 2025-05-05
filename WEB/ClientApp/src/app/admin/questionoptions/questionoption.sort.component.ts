import { Component as NgComponent, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CdkDragDrop, CdkDragStart, moveItemInArray } from '@angular/cdk/drag-drop';
import { QuestionOptionSearchOptions, QuestionOptionSearchResponse, QuestionOption } from '../../common/models/questionoption.model';
import { QuestionOptionService } from '../../common/services/questionoption.service';
import { PagingHeaders } from '../../common/models/http.model';
import { ErrorService } from '../../common/services/error.service';
import { ToastrService } from 'ngx-toastr';

@NgComponent({
    selector: 'question-option-sort',
    templateUrl: './questionoption.sort.component.html',
    standalone: false
})
export class QuestionOptionSortComponent implements OnInit {

    public headers: PagingHeaders = new PagingHeaders();
    private bodyElement: HTMLElement = document.body;
    public questionOptions: QuestionOption[];
    public questionOptionGroupId: string;

    constructor(
        public modal: NgbActiveModal,
        private questionOptionService: QuestionOptionService,
        private errorService: ErrorService,
        private toastr: ToastrService
    ) {
    }

    ngOnInit(): void {
        this.questionOptionService.search({ questionOptionGroupId: this.questionOptionGroupId, pageSize: 0, includeParents: true } as QuestionOptionSearchOptions)
            .subscribe({
                next: response => this.questionOptions = response.questionOptions,
                error: err => this.errorService.handleError(err, "QuestionOptions", "Load")
            });
    }

    dragStart(event: CdkDragStart) {
        this.bodyElement.classList.add('inheritCursors');
        this.bodyElement.style.cursor = 'grabbing';
    }

    drop(event: CdkDragDrop<QuestionOption[]>) {
        this.bodyElement.classList.remove('inheritCursors');
        this.bodyElement.style.cursor = 'unset';
        moveItemInArray(this.questionOptions, event.previousIndex, event.currentIndex);
    }

    close() {
        this.questionOptionService.sort(this.questionOptionGroupId, this.questionOptions.map(o => o.questionOptionId))
            .subscribe({
                next: () => {
                    this.modal.close();
                    this.toastr.success("The sort order has been updated", "Change Sort Order");
                },
                error: err => {
                    this.errorService.handleError(err, "QuestionOptions", "Sort");
                }
            });
    }

}

