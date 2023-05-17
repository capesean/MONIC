import { Component as NgComponent, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmModalComponent, ModalOptions } from '../../common/components/confirm.component';
import { FieldValue } from '../../common/models/fieldvalue.model';
import { BreadcrumbService } from '../../common/services/breadcrumb.service';
import { ErrorService } from '../../common/services/error.service';
import { FieldValueService } from '../../common/services/fieldvalue.service';

@NgComponent({
    selector: 'fieldvalue-edit',
    templateUrl: './fieldvalue.edit.component.html'
})
export class FieldValueEditComponent implements OnInit {

    public fieldValue: FieldValue = new FieldValue();
    public isNew = true;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private toastr: ToastrService,
        private breadcrumbService: BreadcrumbService,
        private modalService: NgbModal,
        private fieldValueService: FieldValueService,
        private errorService: ErrorService
    ) {
    }

    ngOnInit(): void {

        this.route.params.subscribe(params => {

            const itemId = params["itemId"];
            const fieldId = params["fieldId"];
            this.isNew = itemId === "add" && fieldId === "add";

            if (!this.isNew) {

                this.fieldValue.itemId = itemId;
                this.fieldValue.fieldId = fieldId;
                this.loadFieldValue();

            }

        });

    }

    private loadFieldValue(): void {

        this.fieldValueService.get(this.fieldValue.itemId, this.fieldValue.fieldId)
            .subscribe({
                next: fieldValue => {
                    this.fieldValue = fieldValue;
                    this.changeBreadcrumb();
                },
                error: err => {
                    this.errorService.handleError(err, "Field Value", "Load");
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

        this.fieldValueService.save(this.fieldValue)
            .subscribe({
                next: fieldValue => {
                    this.toastr.success("The field value has been saved", "Save Field Value");
                    if (this.isNew) this.router.navigate(["../", fieldValue.itemId, fieldValue.fieldId], { relativeTo: this.route });
                },
                error: err => {
                    this.errorService.handleError(err, "Field Value", "Save");
                }
            });

    }

    delete(): void {

        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Field Value", text: "Are you sure you want to delete this field value?", deleteStyle: true, ok: "Delete" } as ModalOptions;
        modalRef.result.then(
            () => {

                this.fieldValueService.delete(this.fieldValue.itemId, this.fieldValue.fieldId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The field value has been deleted", "Delete Field Value");
                            this.router.navigate(["../../"], { relativeTo: this.route });
                        },
                        error: err => {
                            this.errorService.handleError(err, "Field Value", "Delete");
                        }
                    });

            }, () => { });
    }

    changeBreadcrumb(): void {
        this.breadcrumbService.changeBreadcrumb(this.route.snapshot, this.fieldValue.fieldId ? this.fieldValue.field?.name?.substring(0, 25) : "(new field value)");
    }

}
