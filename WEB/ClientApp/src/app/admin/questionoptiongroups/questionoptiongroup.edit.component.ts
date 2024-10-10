import { Component as NgComponent, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmModalComponent, ConfirmModalOptions } from '../../common/components/confirm.component';
import { PagingHeaders } from '../../common/models/http.model';
import { QuestionOptionGroup } from '../../common/models/questionoptiongroup.model';
import { Enum, Enums } from '../../common/models/enums.model';
import { BreadcrumbService } from '../../common/services/breadcrumb.service';
import { ErrorService } from '../../common/services/error.service';
import { QuestionOptionGroupService } from '../../common/services/questionoptiongroup.service';
import { Question, QuestionSearchOptions, QuestionSearchResponse } from '../../common/models/question.model';
import { QuestionService } from '../../common/services/question.service';
import { QuestionOption, QuestionOptionSearchOptions, QuestionOptionSearchResponse } from '../../common/models/questionoption.model';
import { QuestionOptionService } from '../../common/services/questionoption.service';
import { QuestionOptionSortComponent } from '../questionoptions/questionoption.sort.component';

@NgComponent({
    selector: 'questionoptiongroup-edit',
    templateUrl: './questionoptiongroup.edit.component.html'
})
export class QuestionOptionGroupEditComponent implements OnInit, OnDestroy {

    public questionOptionGroup: QuestionOptionGroup = new QuestionOptionGroup();
    public isNew = true;
    private routerSubscription: Subscription;
    public questionTypes: Enum[] = Enums.QuestionTypes;

    public questionOptionsSearchOptions = new QuestionOptionSearchOptions();
    public questionOptionsHeaders = new PagingHeaders();
    public questionOptions: QuestionOption[] = [];
    public showQuestionOptionsSearch = false;

    public questionsSearchOptions = new QuestionSearchOptions();
    public questionsHeaders = new PagingHeaders();
    public questions: Question[] = [];
    public showQuestionsSearch = false;

    constructor(
        private router: Router,
        public route: ActivatedRoute,
        private toastr: ToastrService,
        private breadcrumbService: BreadcrumbService,
        private modalService: NgbModal,
        private questionOptionGroupService: QuestionOptionGroupService,
        private questionService: QuestionService,
        private questionOptionService: QuestionOptionService,
        private errorService: ErrorService
    ) {
    }

    ngOnInit(): void {

        this.route.params.subscribe(params => {

            const questionOptionGroupId = params["questionOptionGroupId"];
            this.isNew = questionOptionGroupId === "add";

            if (!this.isNew) {

                this.questionOptionGroup.questionOptionGroupId = questionOptionGroupId;
                this.loadQuestionOptionGroup();

                this.questionOptionsSearchOptions.questionOptionGroupId = questionOptionGroupId;
                this.questionOptionsSearchOptions.includeParents = true;
                this.searchQuestionOptions();

                this.questionsSearchOptions.questionOptionGroupId = questionOptionGroupId;
                this.questionsSearchOptions.includeParents = true;
                this.searchQuestions();

            }

            this.routerSubscription = this.router.events.subscribe(event => {
                if (event instanceof NavigationEnd && !this.route.firstChild) {
                    // this will double-load on new save, as params change (above) + nav ends
                    this.searchQuestionOptions();
                }
            });

        });

    }

    ngOnDestroy(): void {
        this.routerSubscription.unsubscribe();
    }

    private loadQuestionOptionGroup(): void {

        this.questionOptionGroupService.get(this.questionOptionGroup.questionOptionGroupId)
            .subscribe({
                next: questionOptionGroup => {
                    this.questionOptionGroup = questionOptionGroup;
                    this.changeBreadcrumb();
                },
                error: err => {
                    this.errorService.handleError(err, "Question Option Group", "Load");
                    if (err instanceof HttpErrorResponse && err.status === 404)
                        this.router.navigate(["../"], { relativeTo: this.route });
                }
            });

    }

    save(form: NgForm): void {

        if (form.invalid) {

            this.toastr.error("The form has not been completed correctly.", "Form Error");
            return;

        }

        this.questionOptionGroupService.save(this.questionOptionGroup)
            .subscribe({
                next: questionOptionGroup => {
                    this.toastr.success("The question option group has been saved", "Save Question Option Group");
                    if (this.isNew) {
                        this.ngOnDestroy();
                        this.router.navigate(["../", questionOptionGroup.questionOptionGroupId], { relativeTo: this.route });
                    }
                },
                error: err => {
                    this.errorService.handleError(err, "Question Option Group", "Save");
                }
            });

    }

    delete(): void {

        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Question Option Group", text: "Are you sure you want to delete this question option group?", deleteStyle: true, ok: "Delete" } as ConfirmModalOptions;
        modalRef.result.then(
            () => {

                this.questionOptionGroupService.delete(this.questionOptionGroup.questionOptionGroupId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The question option group has been deleted", "Delete Question Option Group");
                            this.router.navigate(["../"], { relativeTo: this.route });
                        },
                        error: err => {
                            this.errorService.handleError(err, "Question Option Group", "Delete");
                        }
                    });

            }, () => { });
    }

    changeBreadcrumb(): void {
        this.breadcrumbService.changeBreadcrumb(this.route.snapshot, this.questionOptionGroup.name !== undefined ? this.questionOptionGroup.name.substring(0, 25) : "(new question option group)");
    }

    searchQuestionOptions(pageIndex = 0): Subject<QuestionOptionSearchResponse> {

        this.questionOptionsSearchOptions.pageIndex = pageIndex;

        const subject = new Subject<QuestionOptionSearchResponse>()

        this.questionOptionService.search(this.questionOptionsSearchOptions)
            .subscribe({
                next: response => {
                    subject.next(response);
                    this.questionOptions = response.questionOptions;
                    this.questionOptionsHeaders = response.headers;
                },
                error: err => {
                    this.errorService.handleError(err, "Options", "Load");
                }
            });

        return subject;

    }

    goToQuestionOption(questionOption: QuestionOption): void {
        this.router.navigate(["questionoptions", questionOption.questionOptionId], { relativeTo: this.route });
    }

    deleteQuestionOption(questionOption: QuestionOption, event: MouseEvent): void {
        event.stopPropagation();

        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Option", text: "Are you sure you want to delete this option?", deleteStyle: true, ok: "Delete" } as ConfirmModalOptions;
        modalRef.result.then(
            () => {

                this.questionOptionService.delete(questionOption.questionOptionId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The option has been deleted", "Delete Option");
                            this.searchQuestionOptions(this.questionOptionsHeaders.pageIndex);
                        },
                        error: err => {
                            this.errorService.handleError(err, "Option", "Delete");
                        }
                    });

            }, () => { });
    }

    deleteQuestionOptions(): void {
        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Options", text: "Are you sure you want to delete all the options?", deleteStyle: true, ok: "Delete" } as ConfirmModalOptions;
        modalRef.result.then(
            () => {

                this.questionOptionGroupService.deleteQuestionOptions(this.questionOptionGroup.questionOptionGroupId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The options have been deleted", "Delete Options");
                            this.searchQuestionOptions();
                        },
                        error: err => {
                            this.errorService.handleError(err, "Options", "Delete");
                        }
                    });
            }, () => { });

    }

    searchQuestions(pageIndex = 0): Subject<QuestionSearchResponse> {

        this.questionsSearchOptions.pageIndex = pageIndex;

        const subject = new Subject<QuestionSearchResponse>()

        this.questionService.search(this.questionsSearchOptions)
            .subscribe({
                next: response => {
                    subject.next(response);
                    this.questions = response.questions;
                    this.questionsHeaders = response.headers;
                },
                error: err => {
                    this.errorService.handleError(err, "Questions", "Load");
                }
            });

        return subject;

    }

    goToQuestion(question: Question): void {
        this.router.navigate(["/questionnaires", question.section.questionnaire.questionnaireId, "sections", question.section.sectionId, "questions", question.questionId]);
    }

    deleteQuestion(question: Question, event: MouseEvent): void {
        event.stopPropagation();

        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Question", text: "Are you sure you want to delete this question?", deleteStyle: true, ok: "Delete" } as ConfirmModalOptions;
        modalRef.result.then(
            () => {

                this.questionService.delete(question.questionId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The question has been deleted", "Delete Question");
                            this.searchQuestions(this.questionsHeaders.pageIndex);
                        },
                        error: err => {
                            this.errorService.handleError(err, "Question", "Delete");
                        }
                    });

            }, () => { });
    }

    deleteQuestions(): void {
        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Questions", text: "Are you sure you want to delete all the questions?", deleteStyle: true, ok: "Delete" } as ConfirmModalOptions;
        modalRef.result.then(
            () => {

                this.questionOptionGroupService.deleteQuestions(this.questionOptionGroup.questionOptionGroupId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The questions have been deleted", "Delete Questions");
                            this.searchQuestions();
                        },
                        error: err => {
                            this.errorService.handleError(err, "Questions", "Delete");
                        }
                    });
            }, () => { });

    }

    showQuestionOptionSort(): void {
        let modalRef = this.modalService.open(QuestionOptionSortComponent, { size: 'xl', centered: true, scrollable: false });
        (modalRef.componentInstance as QuestionOptionSortComponent).questionOptionGroupId = this.questionOptionGroup.questionOptionGroupId;
        modalRef.result.then(
            () => this.searchQuestionOptions(this.questionOptionsHeaders.pageIndex),
            () => { }
        );
    }

}
