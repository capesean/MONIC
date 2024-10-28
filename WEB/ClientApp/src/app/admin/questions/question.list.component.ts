import { Component as NgComponent, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PagingHeaders } from '../../common/models/http.model';
import { QuestionSearchOptions, QuestionSearchResponse, Question } from '../../common/models/question.model';
import { Enum, Enums } from '../../common/models/enums.model';
import { FadeThenShrink } from '../../common/animations/fadethenshrink';
import { ErrorService } from '../../common/services/error.service';
import { QuestionService } from '../../common/services/question.service';
import { QuestionSortComponent } from './question.sort.component';

@NgComponent({
    selector: 'question-list',
    templateUrl: './question.list.component.html',
    animations: [FadeThenShrink]
})
export class QuestionListComponent implements OnInit, OnDestroy {

    public questions: Question[] = [];
    public searchOptions = new QuestionSearchOptions();
    public showSearchOptions = false;
    public headers = new PagingHeaders();
    private routerSubscription: Subscription;
    public questionTypes: Enum[] = Enums.QuestionTypes;

    constructor(
        public route: ActivatedRoute,
        private router: Router,
        private errorService: ErrorService,
        private modalService: NgbModal,
        private questionService: QuestionService
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

    runSearch(pageIndex = 0): Subject<QuestionSearchResponse> {

        this.searchOptions.pageIndex = pageIndex;

        const subject = new Subject<QuestionSearchResponse>();

        this.questionService.search(this.searchOptions)
            .subscribe({
                next: response => {
                    subject.next(response);
                    this.questions = response.questions;
                    this.headers = response.headers;
                },
                error: err => {
                    this.errorService.handleError(err, "Questions", "Load");
                }
            });

        return subject;

    }

    showSort(): void {
        let modalRef = this.modalService.open(QuestionSortComponent, { size: 'xl', centered: true, scrollable: false });
        modalRef.result.then(
            () => {

                this.searchOptions.orderBy = null;
                this.runSearch(this.headers.pageIndex);

            }, () => { });
    }

    goToQuestion(question: Question): void {
        this.router.navigate(["/questionnaires", question.section.questionnaire.questionnaireId, "sections", question.section.sectionId, "questions", question.questionId]);
    }
}

