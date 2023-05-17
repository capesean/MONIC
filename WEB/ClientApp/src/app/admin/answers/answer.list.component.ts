import { Component as NgComponent, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { PagingHeaders } from '../../common/models/http.model';
import { AnswerSearchOptions, AnswerSearchResponse, Answer } from '../../common/models/answer.model';
import { ErrorService } from '../../common/services/error.service';
import { AnswerService } from '../../common/services/answer.service';

@NgComponent({
    selector: 'answer-list',
    templateUrl: './answer.list.component.html'
})
export class AnswerListComponent implements OnInit, OnDestroy {

    public answers: Answer[] = [];
    public searchOptions = new AnswerSearchOptions();
    public headers = new PagingHeaders();
    private routerSubscription: Subscription;

    constructor(
        public route: ActivatedRoute,
        private router: Router,
        private errorService: ErrorService,
        private answerService: AnswerService
    ) {
    }

    ngOnInit(): void {
        this.searchOptions.includeParents = true;
        this.routerSubscription = this.router.events.subscribe(event => {
            if (event instanceof NavigationEnd && !this.route.firstChild) {
                this.runSearch();
            }
        });
        this.runSearch();
    }

    ngOnDestroy(): void {
        this.routerSubscription.unsubscribe();
    }

    runSearch(pageIndex = 0): Subject<AnswerSearchResponse> {

        this.searchOptions.pageIndex = pageIndex;

        const subject = new Subject<AnswerSearchResponse>();

        this.answerService.search(this.searchOptions)
            .subscribe({
                next: response => {
                    subject.next(response);
                    this.answers = response.answers;
                    this.headers = response.headers;
                },
                error: err => {
                    this.errorService.handleError(err, "Answers", "Load");
                }
            });

        return subject;

    }

    goToAnswer(answer: Answer): void {
        this.router.navigate(["/questionnaires", answer.response.questionnaire.questionnaireId, "responses", answer.response.responseId, "answers", answer.answerId]);
    }
}

