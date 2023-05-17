import { Component as NgComponent, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmModalComponent, ModalOptions } from '../../common/components/confirm.component';
import { PagingHeaders } from '../../common/models/http.model';
import { Answer } from '../../common/models/answer.model';
import { BreadcrumbService } from '../../common/services/breadcrumb.service';
import { ErrorService } from '../../common/services/error.service';
import { AnswerService } from '../../common/services/answer.service';
import { AnswerOption, AnswerOptionSearchOptions, AnswerOptionSearchResponse } from '../../common/models/answeroption.model';
import { AnswerOptionService } from '../../common/services/answeroption.service';

@NgComponent({
    selector: 'answer-edit',
    templateUrl: './answer.edit.component.html'
})
export class AnswerEditComponent implements OnInit, OnDestroy {

    public answer: Answer = new Answer();
    public isNew = true;
    private routerSubscription: Subscription;

    public answerOptionsSearchOptions = new AnswerOptionSearchOptions();
    public answerOptionsHeaders = new PagingHeaders();
    public answerOptions: AnswerOption[] = [];
    public showAnswerOptionsSearch = false;

    constructor(
        private router: Router,
        public route: ActivatedRoute,
        private toastr: ToastrService,
        private breadcrumbService: BreadcrumbService,
        private modalService: NgbModal,
        private answerService: AnswerService,
        private answerOptionService: AnswerOptionService,
        private errorService: ErrorService
    ) {
    }

    ngOnInit(): void {

        this.route.params.subscribe(params => {

            const answerId = params["answerId"];
            this.answer.responseId = this.route.snapshot.parent.params.responseId;
            this.isNew = answerId === "add";

            if (!this.isNew) {

                this.answer.answerId = answerId;
                this.loadAnswer();

                this.answerOptionsSearchOptions.answerId = answerId;
                this.answerOptionsSearchOptions.includeParents = true;
                this.searchAnswerOptions();

            }

            this.routerSubscription = this.router.events.subscribe(event => {
                if (event instanceof NavigationEnd && !this.route.firstChild) {
                    // this will double-load on new save, as params change (above) + nav ends
                    this.searchAnswerOptions();
                }
            });

        });

    }

    ngOnDestroy(): void {
        this.routerSubscription.unsubscribe();
    }

    private loadAnswer(): void {

        this.answerService.get(this.answer.answerId)
            .subscribe({
                next: answer => {
                    this.answer = answer;
                    this.changeBreadcrumb();
                },
                error: err => {
                    this.errorService.handleError(err, "Answer", "Load");
                    if (err instanceof HttpErrorResponse && err.status === 404)
                        this.router.navigate(["../../"], { relativeTo: this.route });
                }
            });

    }

    save(form: NgForm): void {

        if (form.invalid) {

            this.toastr.error("The form has not been completed correctly.", "Form Error");
            return;

        }

        this.answerService.save(this.answer)
            .subscribe({
                next: answer => {
                    this.toastr.success("The answer has been saved", "Save Answer");
                    if (this.isNew) {
                        this.ngOnDestroy();
                        this.router.navigate(["../", answer.answerId], { relativeTo: this.route });
                    }
                },
                error: err => {
                    this.errorService.handleError(err, "Answer", "Save");
                }
            });

    }

    delete(): void {

        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Answer", text: "Are you sure you want to delete this answer?", deleteStyle: true, ok: "Delete" } as ModalOptions;
        modalRef.result.then(
            () => {

                this.answerService.delete(this.answer.answerId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The answer has been deleted", "Delete Answer");
                            this.router.navigate(["../../"], { relativeTo: this.route });
                        },
                        error: err => {
                            this.errorService.handleError(err, "Answer", "Delete");
                        }
                    });

            }, () => { });
    }

    changeBreadcrumb(): void {
        this.breadcrumbService.changeBreadcrumb(this.route.snapshot, this.answer.questionId ? this.answer.question?.code?.substring(0, 25) : "(new answer)");
    }

    searchAnswerOptions(pageIndex = 0): Subject<AnswerOptionSearchResponse> {

        this.answerOptionsSearchOptions.pageIndex = pageIndex;

        const subject = new Subject<AnswerOptionSearchResponse>()

        this.answerOptionService.search(this.answerOptionsSearchOptions)
            .subscribe({
                next: response => {
                    subject.next(response);
                    this.answerOptions = response.answerOptions;
                    this.answerOptionsHeaders = response.headers;
                },
                error: err => {
                    this.errorService.handleError(err, "Answer Options", "Load");
                }
            });

        return subject;

    }

    goToAnswerOption(answerOption: AnswerOption): void {
        this.router.navigate(["answeroptions", answerOption.questionOptionId], { relativeTo: this.route });
    }

    deleteAnswerOption(answerOption: AnswerOption, event: MouseEvent): void {
        event.stopPropagation();

        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Answer Option", text: "Are you sure you want to delete this answer option?", deleteStyle: true, ok: "Delete" } as ModalOptions;
        modalRef.result.then(
            () => {

                this.answerOptionService.delete(answerOption.answerId, answerOption.questionOptionId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The answer option has been deleted", "Delete Answer Option");
                            this.searchAnswerOptions(this.answerOptionsHeaders.pageIndex);
                        },
                        error: err => {
                            this.errorService.handleError(err, "Answer Option", "Delete");
                        }
                    });

            }, () => { });
    }

    deleteAnswerOptions(): void {
        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Answer Options", text: "Are you sure you want to delete all the answer options?", deleteStyle: true, ok: "Delete" } as ModalOptions;
        modalRef.result.then(
            () => {

                this.answerService.deleteAnswerOptions(this.answer.answerId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The answer options have been deleted", "Delete Answer Options");
                            this.searchAnswerOptions();
                        },
                        error: err => {
                            this.errorService.handleError(err, "Answer Options", "Delete");
                        }
                    });
            }, () => { });

    }

}
