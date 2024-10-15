import { Component as NgComponent, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { PagingHeaders } from '../../common/models/http.model';
import { QuestionnaireSearchOptions, QuestionnaireSearchResponse, Questionnaire } from '../../common/models/questionnaire.model';
import { Enum, Enums } from '../../common/models/enums.model';
import { FadeThenShrink } from '../../common/animations/fadethenshrink';
import { ErrorService } from '../../common/services/error.service';
import { QuestionnaireService } from '../../common/services/questionnaire.service';

@NgComponent({
    selector: 'questionnaire-list',
    templateUrl: './questionnaire.list.component.html',
    animations: [FadeThenShrink]
})
export class QuestionnaireListComponent implements OnInit, OnDestroy {

    public questionnaires: Questionnaire[] = [];
    public searchOptions = new QuestionnaireSearchOptions();
    public showSearchOptions = false;
    public headers = new PagingHeaders();
    private routerSubscription: Subscription;
    public dateTypes: Enum[] = Enums.DateTypes;

    constructor(
        public route: ActivatedRoute,
        private router: Router,
        private errorService: ErrorService,
        private questionnaireService: QuestionnaireService
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

    runSearch(pageIndex = 0): Subject<QuestionnaireSearchResponse> {

        this.searchOptions.pageIndex = pageIndex;

        const subject = new Subject<QuestionnaireSearchResponse>();

        this.questionnaireService.search(this.searchOptions)
            .subscribe({
                next: response => {
                    subject.next(response);
                    this.questionnaires = response.questionnaires;
                    this.headers = response.headers;
                },
                error: err => {
                    this.errorService.handleError(err, "Questionnaires", "Load");
                }
            });

        return subject;

    }

    goToQuestionnaire(questionnaire: Questionnaire): void {
        this.router.navigate([questionnaire.questionnaireId], { relativeTo: this.route });
    }
}

