import { Component as NgComponent, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmModalComponent, ConfirmModalOptions } from '../../common/components/confirm.component';
import { QuestionSummary } from '../../common/models/questionsummary.model';
import { BreadcrumbService } from '../../common/services/breadcrumb.service';
import { ErrorService } from '../../common/services/error.service';
import { QuestionSummaryService } from '../../common/services/questionsummary.service';

@NgComponent({
    selector: 'questionsummary-edit',
    templateUrl: './questionsummary.edit.component.html'
})
export class QuestionSummaryEditComponent implements OnInit {

    public questionSummary: QuestionSummary = new QuestionSummary();
    public isNew = true;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private toastr: ToastrService,
        private breadcrumbService: BreadcrumbService,
        private modalService: NgbModal,
        private questionSummaryService: QuestionSummaryService,
        private errorService: ErrorService
    ) {
    }

    ngOnInit(): void {

        this.route.params.subscribe(params => {

            const dateId = params["dateId"];
            this.questionSummary.questionId = this.route.snapshot.parent.params.questionId;
            this.isNew = dateId === "add";

            if (!this.isNew) {

                this.questionSummary.dateId = dateId;
                this.loadQuestionSummary();

            }

        });

    }

    private loadQuestionSummary(): void {

        this.questionSummaryService.get(this.questionSummary.questionId, this.questionSummary.dateId)
            .subscribe({
                next: questionSummary => {
                    this.questionSummary = questionSummary;
                    this.changeBreadcrumb();
                },
                error: err => {
                    this.errorService.handleError(err, "Question Summary", "Load");
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

        this.questionSummaryService.save(this.questionSummary)
            .subscribe({
                next: questionSummary => {
                    this.toastr.success("The question summary has been saved", "Save Question Summary");
                    if (this.isNew) this.router.navigate(["../", questionSummary.dateId], { relativeTo: this.route });
                },
                error: err => {
                    this.errorService.handleError(err, "Question Summary", "Save");
                }
            });

    }

    delete(): void {

        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Question Summary", text: "Are you sure you want to delete this question summary?", deleteStyle: true, ok: "Delete" } as ConfirmModalOptions;
        modalRef.result.then(
            () => {

                this.questionSummaryService.delete(this.questionSummary.questionId, this.questionSummary.dateId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The question summary has been deleted", "Delete Question Summary");
                            this.router.navigate(["../../"], { relativeTo: this.route });
                        },
                        error: err => {
                            this.errorService.handleError(err, "Question Summary", "Delete");
                        }
                    });

            }, () => { });
    }

    changeBreadcrumb(): void {
        this.breadcrumbService.changeBreadcrumb(this.route.snapshot, this.questionSummary.questionId ? this.questionSummary.question?.code?.substring(0, 25) : "(new question summary)");
    }

}
