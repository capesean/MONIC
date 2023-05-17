import { Component as NgComponent, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { PagingHeaders } from '../../common/models/http.model';
import { QuestionSummarySearchOptions, QuestionSummarySearchResponse, QuestionSummary } from '../../common/models/questionsummary.model';
import { ErrorService } from '../../common/services/error.service';
import { QuestionSummaryService } from '../../common/services/questionsummary.service';

@NgComponent({
    selector: 'questionsummary-list',
    templateUrl: './questionsummary.list.component.html'
})
export class QuestionSummaryListComponent implements OnInit {

    public questionSummaries: QuestionSummary[] = [];
    public searchOptions = new QuestionSummarySearchOptions();
    public headers = new PagingHeaders();

    constructor(
        public route: ActivatedRoute,
        private router: Router,
        private errorService: ErrorService,
        private questionSummaryService: QuestionSummaryService
    ) {
    }

    ngOnInit(): void {
        this.searchOptions.includeParents = true;
        this.runSearch();
    }

    runSearch(pageIndex = 0): Subject<QuestionSummarySearchResponse> {

        this.searchOptions.pageIndex = pageIndex;

        const subject = new Subject<QuestionSummarySearchResponse>();

        this.questionSummaryService.search(this.searchOptions)
            .subscribe({
                next: response => {
                    subject.next(response);
                    this.questionSummaries = response.questionSummaries;
                    this.headers = response.headers;
                },
                error: err => {
                    this.errorService.handleError(err, "Question Summaries", "Load");
                }
            });

        return subject;

    }

    goToQuestionSummary(questionSummary: QuestionSummary): void {
        this.router.navigate(["/questionnaires", questionSummary.question.section.questionnaire.questionnaireId, "sections", questionSummary.question.section.sectionId, "questions", questionSummary.question.questionId, "questionsummaries", questionSummary.dateId]);
    }
}

