import { Component as NgComponent, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmModalComponent, ConfirmModalOptions } from '../../common/components/confirm.component';
import { AnswerOption } from '../../common/models/answeroption.model';
import { BreadcrumbService } from '../../common/services/breadcrumb.service';
import { ErrorService } from '../../common/services/error.service';
import { AnswerOptionService } from '../../common/services/answeroption.service';

@NgComponent({
    selector: 'answeroption-edit',
    templateUrl: './answeroption.edit.component.html'
})
export class AnswerOptionEditComponent implements OnInit {

    public answerOption: AnswerOption = new AnswerOption();
    public isNew = true;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private toastr: ToastrService,
        private breadcrumbService: BreadcrumbService,
        private modalService: NgbModal,
        private answerOptionService: AnswerOptionService,
        private errorService: ErrorService
    ) {
    }

    ngOnInit(): void {

        this.route.params.subscribe(params => {

            const questionOptionId = params["questionOptionId"];
            this.answerOption.answerId = this.route.snapshot.parent.params.answerId;
            this.isNew = questionOptionId === "add";

            if (!this.isNew) {

                this.answerOption.questionOptionId = questionOptionId;
                this.loadAnswerOption();

            }

        });

    }

    private loadAnswerOption(): void {

        this.answerOptionService.get(this.answerOption.answerId, this.answerOption.questionOptionId)
            .subscribe({
                next: answerOption => {
                    this.answerOption = answerOption;
                    this.changeBreadcrumb();
                },
                error: err => {
                    this.errorService.handleError(err, "Answer Option", "Load");
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

        this.answerOptionService.save(this.answerOption)
            .subscribe({
                next: answerOption => {
                    this.toastr.success("The answer option has been saved", "Save Answer Option");
                    if (this.isNew) this.router.navigate(["../", answerOption.questionOptionId], { relativeTo: this.route });
                },
                error: err => {
                    this.errorService.handleError(err, "Answer Option", "Save");
                }
            });

    }

    delete(): void {

        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Answer Option", text: "Are you sure you want to delete this answer option?", deleteStyle: true, ok: "Delete" } as ConfirmModalOptions;
        modalRef.result.then(
            () => {

                this.answerOptionService.delete(this.answerOption.answerId, this.answerOption.questionOptionId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The answer option has been deleted", "Delete Answer Option");
                            this.router.navigate(["../../"], { relativeTo: this.route });
                        },
                        error: err => {
                            this.errorService.handleError(err, "Answer Option", "Delete");
                        }
                    });

            }, () => { });
    }

    changeBreadcrumb(): void {
        this.breadcrumbService.changeBreadcrumb(this.route.snapshot, this.answerOption.questionOptionId ? this.answerOption.questionOption?.label?.substring(0, 25) : "(new answer option)");
    }

}
