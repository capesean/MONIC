import { Component as NgComponent, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmModalComponent, ConfirmModalOptions } from '../../common/components/confirm.component';
import { PagingHeaders } from '../../common/models/http.model';
import { Response } from '../../common/models/response.model';
import { FadeThenShrink } from '../../common/animations/fadethenshrink';
import { BreadcrumbService } from '../../common/services/breadcrumb.service';
import { ErrorService } from '../../common/services/error.service';
import { ResponseService } from '../../common/services/response.service';
import { Answer, AnswerSearchOptions, AnswerSearchResponse } from '../../common/models/answer.model';
import { AnswerService } from '../../common/services/answer.service';
import { QuestionnaireService } from '../../common/services/questionnaire.service';
import { EntityType } from '../../common/models/entitytype.model';
import { Enum, Enums } from '../../common/models/enums.model';
import { Clipboard } from '@angular/cdk/clipboard';
import { environment } from '../../../environments/environment';

@NgComponent({
    selector: 'response-edit',
    templateUrl: './response.edit.component.html',
    animations: [FadeThenShrink]
})
export class ResponseEditComponent implements OnInit, OnDestroy {

    public response: Response = new Response();
    public isNew = true;
    private routerSubscription: Subscription;

    public answersSearchOptions = new AnswerSearchOptions();
    public answersHeaders = new PagingHeaders();
    public answers: Answer[] = [];
    public showAnswersSearch = false;

    public entityType: EntityType;
    public dateType: Enum;

    constructor(
        private questionnaireService: QuestionnaireService,
        private router: Router,
        public route: ActivatedRoute,
        private toastr: ToastrService,
        private breadcrumbService: BreadcrumbService,
        private modalService: NgbModal,
        private responseService: ResponseService,
        private answerService: AnswerService,
        private errorService: ErrorService,
        private clipboard: Clipboard
    ) {
    }

    ngOnInit(): void {

        this.route.params.subscribe(params => {

            const responseId = params["responseId"];
            this.response.questionnaireId = this.route.snapshot.parent.params.questionnaireId;
            this.isNew = responseId === "add";

            if (!this.isNew) {

                this.response.responseId = responseId;
                this.loadResponse();

                this.answersSearchOptions.responseId = responseId;
                this.answersSearchOptions.includeParents = true;
                this.searchAnswers();

            }

            this.routerSubscription = this.router.events.subscribe(event => {
                if (event instanceof NavigationEnd && !this.route.firstChild) {
                    // this will double-load on new save, as params change (above) + nav ends
                    this.searchAnswers();
                }
            });

            this.questionnaireService.get(this.response.questionnaireId)
                .subscribe(o => {
                    this.entityType = o.entityType;
                    this.dateType = Enums.DateTypes[o.dateType];
                });

        });

    }

    ngOnDestroy(): void {
        this.routerSubscription.unsubscribe();
    }

    private loadResponse(): void {

        this.responseService.get(this.response.responseId)
            .subscribe({
                next: response => {
                    this.response = response;
                    this.changeBreadcrumb();
                },
                error: err => {
                    this.errorService.handleError(err, "Response", "Load");
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

        this.responseService.save(this.response)
            .subscribe({
                next: response => {
                    this.toastr.success("The response has been saved", "Save Response");
                    if (this.isNew) {
                        this.ngOnDestroy();
                        this.router.navigate(["../", response.responseId], { relativeTo: this.route });
                    }
                },
                error: err => {
                    this.errorService.handleError(err, "Response", "Save");
                }
            });

    }

    delete(): void {

        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Response", text: "Are you sure you want to delete this response?", deleteStyle: true, ok: "Delete" } as ConfirmModalOptions;
        modalRef.result.then(
            () => {

                this.responseService.delete(this.response.responseId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The response has been deleted", "Delete Response");
                            this.router.navigate(["../../"], { relativeTo: this.route });
                        },
                        error: err => {
                            this.errorService.handleError(err, "Response", "Delete");
                        }
                    });

            }, () => { });
    }

    changeBreadcrumb(): void {
        this.breadcrumbService.changeBreadcrumb(this.route.snapshot, this.response.questionnaireId ? this.response.questionnaire?.name?.substring(0, 25) : "(new response)");
    }

    searchAnswers(pageIndex = 0): Subject<AnswerSearchResponse> {

        this.answersSearchOptions.pageIndex = pageIndex;

        const subject = new Subject<AnswerSearchResponse>()

        this.answerService.search(this.answersSearchOptions)
            .subscribe({
                next: response => {
                    subject.next(response);
                    this.answers = response.answers;
                    this.answersHeaders = response.headers;
                },
                error: err => {
                    this.errorService.handleError(err, "Answers", "Load");
                }
            });

        return subject;

    }

    goToAnswer(answer: Answer): void {
        this.router.navigate(["answers", answer.answerId], { relativeTo: this.route });
    }

    deleteAnswer(answer: Answer, event: MouseEvent): void {
        event.stopPropagation();

        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Answer", text: "Are you sure you want to delete this answer?", deleteStyle: true, ok: "Delete" } as ConfirmModalOptions;
        modalRef.result.then(
            () => {

                this.answerService.delete(answer.answerId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The answer has been deleted", "Delete Answer");
                            this.searchAnswers(this.answersHeaders.pageIndex);
                        },
                        error: err => {
                            this.errorService.handleError(err, "Answer", "Delete");
                        }
                    });

            }, () => { });
    }

    deleteAnswers(): void {
        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Answers", text: "Are you sure you want to delete all the answers?", deleteStyle: true, ok: "Delete" } as ConfirmModalOptions;
        modalRef.result.then(
            () => {

                this.responseService.deleteAnswers(this.response.responseId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The answers have been deleted", "Delete Answers");
                            this.searchAnswers();
                        },
                        error: err => {
                            this.errorService.handleError(err, "Answers", "Delete");
                        }
                    });
            }, () => { });

    }

    public download(): void {
        this.questionnaireService.download(this.response.questionnaireId, this.response.responseId, undefined, false, false)
            .subscribe({
                error: err => this.errorService.handleError(err, "PDF", "Download")
            });
    }

    public unsubmit(): void {

        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Unsubmit Response", text: "Are you sure you want to unsubmit this response?", deleteStyle: true, ok: "Unsubmit" } as ConfirmModalOptions;
        modalRef.result.then(
            () => {
                this.responseService.unsubmit(this.response.responseId)
                    .subscribe({
                        next: response => {
                            this.response = response;
                            this.toastr.success("The response has been unsubmitted", "Unsubmit Response");
                        },
                        error: err => {
                            this.errorService.handleError(err, "Response", "Unsubmit");
                        }
                    });
            });
    }

    public recalculate(): void {
        this.responseService.recalculate(this.response.responseId)
            .subscribe({
                next: response => {
                    this.response = response;
                    this.toastr.success("The progress has been recalculated", "Recalculate Progress");
                },
                error: err => {
                    this.errorService.handleError(err, "Progress", "Recalculate");
                }
            });
    }

    public copyUrl(): void {
        if (!this.response.publicCode) {
            this.toastr.error("This response does not have a public code (URL).");
            return;
        }
        this.clipboard.copy(`${environment.baseUrl}public/response/${this.response.publicCode}`);
        this.toastr.success("The public access URL has been copied to the clipboard.");
    }
}
