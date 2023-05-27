import { Component as NgComponent, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PagingHeaders } from '../../common/models/http.model';
import { QuestionOptionSearchOptions, QuestionOptionSearchResponse, QuestionOption } from '../../common/models/questionoption.model';
import { ErrorService } from '../../common/services/error.service';
import { QuestionOptionService } from '../../common/services/questionoption.service';
import { QuestionOptionSortComponent } from './questionoption.sort.component';

@NgComponent({
    selector: 'questionoption-list',
    templateUrl: './questionoption.list.component.html'
})
export class QuestionOptionListComponent implements OnInit {

    public questionOptions: QuestionOption[] = [];
    public searchOptions = new QuestionOptionSearchOptions();
    public headers = new PagingHeaders();

    constructor(
        public route: ActivatedRoute,
        private router: Router,
        private errorService: ErrorService,
        private modalService: NgbModal,
        private questionOptionService: QuestionOptionService
    ) {
    }

    ngOnInit(): void {
        this.searchOptions.includeParents = true;
        this.runSearch();
    }

    runSearch(pageIndex = 0): Subject<QuestionOptionSearchResponse> {

        this.searchOptions.pageIndex = pageIndex;

        const subject = new Subject<QuestionOptionSearchResponse>();

        this.questionOptionService.search(this.searchOptions)
            .subscribe({
                next: response => {
                    subject.next(response);
                    this.questionOptions = response.questionOptions;
                    this.headers = response.headers;
                },
                error: err => {
                    this.errorService.handleError(err, "Options", "Load");
                }
            });

        return subject;

    }

    showSort(): void {
        let modalRef = this.modalService.open(QuestionOptionSortComponent, { size: 'xl', centered: true, scrollable: true });
        modalRef.result.then(
            () => {

                this.searchOptions.orderBy = null;
                this.runSearch(this.headers.pageIndex);

            }, () => { });
    }

    goToQuestionOption(questionOption: QuestionOption): void {
        this.router.navigate(["/questionoptiongroups", questionOption.questionOptionGroup.questionOptionGroupId, "questionoptions", questionOption.questionOptionId]);
    }
}

