import { Component as NgComponent, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { PagingHeaders } from '../../common/models/http.model';
import { AnswerOptionSearchOptions, AnswerOptionSearchResponse, AnswerOption } from '../../common/models/answeroption.model';
import { ErrorService } from '../../common/services/error.service';
import { AnswerOptionService } from '../../common/services/answeroption.service';

@NgComponent({
    selector: 'answeroption-list',
    templateUrl: './answeroption.list.component.html'
})
export class AnswerOptionListComponent implements OnInit {

    public answerOptions: AnswerOption[] = [];
    public searchOptions = new AnswerOptionSearchOptions();
    public headers = new PagingHeaders();

    constructor(
        public route: ActivatedRoute,
        private router: Router,
        private errorService: ErrorService,
        private answerOptionService: AnswerOptionService
    ) {
    }

    ngOnInit(): void {
        this.searchOptions.includeParents = true;
        this.runSearch();
    }

    runSearch(pageIndex = 0): Subject<AnswerOptionSearchResponse> {

        this.searchOptions.pageIndex = pageIndex;

        const subject = new Subject<AnswerOptionSearchResponse>();

        this.answerOptionService.search(this.searchOptions)
            .subscribe({
                next: response => {
                    subject.next(response);
                    this.answerOptions = response.answerOptions;
                    this.headers = response.headers;
                },
                error: err => {
                    this.errorService.handleError(err, "Answer Options", "Load");
                }
            });

        return subject;

    }

    goToAnswerOption(answerOption: AnswerOption): void {
        this.router.navigate(["/questionnaires", answerOption.answer.response.questionnaire.questionnaireId, "responses", answerOption.answer.response.responseId, "answers", answerOption.answer.answerId, "answeroptions", answerOption.questionOptionId]);
    }
}

