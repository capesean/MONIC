import { Component as NgComponent, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmModalComponent, ModalOptions } from '../../common/components/confirm.component';
import { OptionValue } from '../../common/models/optionvalue.model';
import { BreadcrumbService } from '../../common/services/breadcrumb.service';
import { ErrorService } from '../../common/services/error.service';
import { OptionValueService } from '../../common/services/optionvalue.service';

@NgComponent({
    selector: 'optionvalue-edit',
    templateUrl: './optionvalue.edit.component.html'
})
export class OptionValueEditComponent implements OnInit {

    public optionValue: OptionValue = new OptionValue();
    public isNew = true;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private toastr: ToastrService,
        private breadcrumbService: BreadcrumbService,
        private modalService: NgbModal,
        private optionValueService: OptionValueService,
        private errorService: ErrorService
    ) {
    }

    ngOnInit(): void {

        this.route.params.subscribe(params => {

            const itemId = params["itemId"];
            const optionId = params["optionId"];
            this.isNew = itemId === "add" && optionId === "add";

            if (!this.isNew) {

                this.optionValue.itemId = itemId;
                this.optionValue.optionId = optionId;
                this.loadOptionValue();

            }

        });

    }

    private loadOptionValue(): void {

        this.optionValueService.get(this.optionValue.itemId, this.optionValue.optionId)
            .subscribe({
                next: optionValue => {
                    this.optionValue = optionValue;
                    this.changeBreadcrumb();
                },
                error: err => {
                    this.errorService.handleError(err, "Option Value", "Load");
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

        this.optionValueService.save(this.optionValue)
            .subscribe({
                next: optionValue => {
                    this.toastr.success("The option value has been saved", "Save Option Value");
                    if (this.isNew) this.router.navigate(["../", optionValue.itemId, optionValue.optionId], { relativeTo: this.route });
                },
                error: err => {
                    this.errorService.handleError(err, "Option Value", "Save");
                }
            });

    }

    delete(): void {

        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Option Value", text: "Are you sure you want to delete this option value?", deleteStyle: true, ok: "Delete" } as ModalOptions;
        modalRef.result.then(
            () => {

                this.optionValueService.delete(this.optionValue.itemId, this.optionValue.optionId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The option value has been deleted", "Delete Option Value");
                            this.router.navigate(["../../"], { relativeTo: this.route });
                        },
                        error: err => {
                            this.errorService.handleError(err, "Option Value", "Delete");
                        }
                    });

            }, () => { });
    }

    changeBreadcrumb(): void {
        this.breadcrumbService.changeBreadcrumb(this.route.snapshot, this.optionValue.optionId ? this.optionValue.option?.name?.substring(0, 25) : "(new option value)");
    }

}
