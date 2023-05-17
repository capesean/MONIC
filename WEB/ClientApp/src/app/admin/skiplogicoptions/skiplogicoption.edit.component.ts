import { Component as NgComponent, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmModalComponent, ModalOptions } from '../../common/components/confirm.component';
import { SkipLogicOption } from '../../common/models/skiplogicoption.model';
import { BreadcrumbService } from '../../common/services/breadcrumb.service';
import { ErrorService } from '../../common/services/error.service';
import { SkipLogicOptionService } from '../../common/services/skiplogicoption.service';

@NgComponent({
    selector: 'skiplogicoption-edit',
    templateUrl: './skiplogicoption.edit.component.html'
})
export class SkipLogicOptionEditComponent implements OnInit {

    public skipLogicOption: SkipLogicOption = new SkipLogicOption();
    public isNew = true;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private toastr: ToastrService,
        private breadcrumbService: BreadcrumbService,
        private modalService: NgbModal,
        private skipLogicOptionService: SkipLogicOptionService,
        private errorService: ErrorService
    ) {
    }

    ngOnInit(): void {

        this.route.params.subscribe(params => {

            const questionId = params["questionId"];
            const checkQuestionOptionId = params["checkQuestionOptionId"];
            this.isNew = questionId === "add" && checkQuestionOptionId === "add";

            if (!this.isNew) {

                this.skipLogicOption.questionId = questionId;
                this.skipLogicOption.checkQuestionOptionId = checkQuestionOptionId;
                this.loadSkipLogicOption();

            }

        });

    }

    private loadSkipLogicOption(): void {

        this.skipLogicOptionService.get(this.skipLogicOption.questionId, this.skipLogicOption.checkQuestionOptionId)
            .subscribe({
                next: skipLogicOption => {
                    this.skipLogicOption = skipLogicOption;
                    this.changeBreadcrumb();
                },
                error: err => {
                    this.errorService.handleError(err, "Skip Logic Option", "Load");
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

        this.skipLogicOptionService.save(this.skipLogicOption)
            .subscribe({
                next: skipLogicOption => {
                    this.toastr.success("The skip logic option has been saved", "Save Skip Logic Option");
                    if (this.isNew) this.router.navigate(["../", skipLogicOption.questionId, skipLogicOption.checkQuestionOptionId], { relativeTo: this.route });
                },
                error: err => {
                    this.errorService.handleError(err, "Skip Logic Option", "Save");
                }
            });

    }

    delete(): void {

        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Skip Logic Option", text: "Are you sure you want to delete this skip logic option?", deleteStyle: true, ok: "Delete" } as ModalOptions;
        modalRef.result.then(
            () => {

                this.skipLogicOptionService.delete(this.skipLogicOption.questionId, this.skipLogicOption.checkQuestionOptionId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The skip logic option has been deleted", "Delete Skip Logic Option");
                            this.router.navigate(["../../"], { relativeTo: this.route });
                        },
                        error: err => {
                            this.errorService.handleError(err, "Skip Logic Option", "Delete");
                        }
                    });

            }, () => { });
    }

    changeBreadcrumb(): void {
        this.breadcrumbService.changeBreadcrumb(this.route.snapshot, this.skipLogicOption.checkQuestionOptionId ? this.skipLogicOption.questionOption?.label?.substring(0, 25) : "(new skip logic option)");
    }

}
