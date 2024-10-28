import { Component as NgComponent, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmModalComponent, ConfirmModalOptions } from '../../common/components/confirm.component';
import { QuestionOption } from '../../common/models/questionoption.model';
import { BreadcrumbService } from '../../common/services/breadcrumb.service';
import { ErrorService } from '../../common/services/error.service';
import { QuestionOptionService } from '../../common/services/questionoption.service';

@NgComponent({
    selector: 'questionoption-edit',
    templateUrl: './questionoption.edit.component.html'
})
export class QuestionOptionEditComponent implements OnInit {

    public questionOption: QuestionOption = new QuestionOption();
    public isNew = true;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private toastr: ToastrService,
        private breadcrumbService: BreadcrumbService,
        private modalService: NgbModal,
        private questionOptionService: QuestionOptionService,
        private errorService: ErrorService
    ) {
    }

    ngOnInit(): void {

        this.route.params.subscribe(params => {

            const questionOptionId = params["questionOptionId"];
            this.questionOption.questionOptionGroupId = this.route.snapshot.parent.params.questionOptionGroupId;
            this.isNew = questionOptionId === "add";

            if (!this.isNew) {

                this.questionOption.questionOptionId = questionOptionId;
                this.loadQuestionOption();

            }

        });

    }

    private loadQuestionOption(): void {

        this.questionOptionService.get(this.questionOption.questionOptionId)
            .subscribe({
                next: questionOption => {
                    this.questionOption = questionOption;
                    this.changeBreadcrumb();
                },
                error: err => {
                    this.errorService.handleError(err, "Option", "Load");
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

        this.questionOptionService.save(this.questionOption)
            .subscribe({
                next: () => {
                    this.toastr.success("The option has been saved", "Save Option");
                    this.router.navigate(["../../"], { relativeTo: this.route });
                },
                error: err => {
                    this.errorService.handleError(err, "Option", "Save");
                }
            });

    }

    delete(): void {

        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Option", text: "Are you sure you want to delete this option?", deleteStyle: true, ok: "Delete" } as ConfirmModalOptions;
        modalRef.result.then(
            () => {

                this.questionOptionService.delete(this.questionOption.questionOptionId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The option has been deleted", "Delete Option");
                            this.router.navigate(["../../"], { relativeTo: this.route });
                        },
                        error: err => {
                            this.errorService.handleError(err, "Option", "Delete");
                        }
                    });

            }, () => { });
    }

    changeBreadcrumb(): void {
        this.breadcrumbService.changeBreadcrumb(this.route.snapshot, this.questionOption.label !== undefined ? this.questionOption.label.substring(0, 25) : "(new option)");
    }

}
