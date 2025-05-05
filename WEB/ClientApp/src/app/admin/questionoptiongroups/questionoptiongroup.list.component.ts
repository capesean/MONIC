import { Component as NgComponent, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { PagingHeaders } from '../../common/models/http.model';
import { QuestionOptionGroupSearchOptions, QuestionOptionGroupSearchResponse, QuestionOptionGroup } from '../../common/models/questionoptiongroup.model';
import { FadeThenShrink } from '../../common/animations/fadethenshrink';
import { ErrorService } from '../../common/services/error.service';
import { QuestionOptionGroupService } from '../../common/services/questionoptiongroup.service';

@NgComponent({
    selector: 'questionoptiongroup-list',
    templateUrl: './questionoptiongroup.list.component.html',
    animations: [FadeThenShrink],
    standalone: false
})
export class QuestionOptionGroupListComponent implements OnInit, OnDestroy {

    public questionOptionGroups: QuestionOptionGroup[] = [];
    public searchOptions = new QuestionOptionGroupSearchOptions();
    public showSearchOptions = false;
    public headers = new PagingHeaders();
    private routerSubscription: Subscription;

    constructor(
        public route: ActivatedRoute,
        private router: Router,
        private errorService: ErrorService,
        private questionOptionGroupService: QuestionOptionGroupService
    ) {
    }

    ngOnInit(): void {
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

    runSearch(pageIndex = 0): Subject<QuestionOptionGroupSearchResponse> {

        this.searchOptions.pageIndex = pageIndex;

        const subject = new Subject<QuestionOptionGroupSearchResponse>();

        this.questionOptionGroupService.search(this.searchOptions)
            .subscribe({
                next: response => {
                    subject.next(response);
                    this.questionOptionGroups = response.questionOptionGroups;
                    this.headers = response.headers;
                },
                error: err => {
                    this.errorService.handleError(err, "Question Option Groups", "Load");
                }
            });

        return subject;

    }

    goToQuestionOptionGroup(questionOptionGroup: QuestionOptionGroup): void {
        this.router.navigate([questionOptionGroup.questionOptionGroupId], { relativeTo: this.route });
    }
}

