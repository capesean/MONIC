import { Component as NgComponent, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmModalComponent, ConfirmModalOptions } from '../../common/components/confirm.component';
import { Field } from '../../common/models/field.model';
import { Enum, Enums, FieldTypes } from '../../common/models/enums.model';
import { BreadcrumbService } from '../../common/services/breadcrumb.service';
import { ErrorService } from '../../common/services/error.service';
import { FieldService } from '../../common/services/field.service';

@NgComponent({
    selector: 'field-edit',
    templateUrl: './field.edit.component.html',
    standalone: false
})
export class FieldEditComponent implements OnInit {

    public field: Field = new Field();
    public isNew = true;
    public fieldTypes: Enum[] = Enums.FieldTypes;
    public sizes: Enum[] = Enums.Sizes;

    public showOptions = false;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private toastr: ToastrService,
        private breadcrumbService: BreadcrumbService,
        private modalService: NgbModal,
        private fieldService: FieldService,
        private errorService: ErrorService
    ) {
    }

    ngOnInit(): void {

        this.route.params.subscribe(params => {

            const fieldId = params["fieldId"];
            this.isNew = fieldId === "add";

            if (!this.isNew) {

                this.field.fieldId = fieldId;
                this.loadField();

            }

        });

    }

    private loadField(): void {

        this.fieldService.get(this.field.fieldId)
            .subscribe({
                next: field => {
                    this.field = field;
                    this.changeBreadcrumb();
                    if (this.field.fieldType === FieldTypes.Picklist) this.showOptions = true;
                },
                error: err => {
                    this.errorService.handleError(err, "Field", "Load");
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

        this.fieldService.save(this.field)
            .subscribe({
                next: field => {
                    this.toastr.success("The field has been saved", "Save Field");
                    if (this.isNew) this.router.navigate(["../", field.fieldId], { relativeTo: this.route });
                },
                error: err => {
                    this.errorService.handleError(err, "Field", "Save");
                }
            });

    }

    delete(): void {

        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Field", text: "Are you sure you want to delete this field?", deleteStyle: true, ok: "Delete" } as ConfirmModalOptions;
        modalRef.result.then(
            () => {

                this.fieldService.delete(this.field.fieldId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The field has been deleted", "Delete Field");
                            this.router.navigate(["../"], { relativeTo: this.route });
                        },
                        error: err => {
                            this.errorService.handleError(err, "Field", "Delete");
                        }
                    });

            }, () => { });
    }

    changeBreadcrumb(): void {
        this.breadcrumbService.changeBreadcrumb(this.route.snapshot, this.field.name !== undefined ? this.field.name.substring(0, 25) : "(new field)");
    }

    showUnique(): boolean {
        return this.field && this.field.fieldType === FieldTypes.Text;
    }

    showLengths(): boolean {
        return this.field && this.field.fieldType === FieldTypes.Text;
    }

    showRegex(): boolean {
        return this.field && this.field.fieldType === FieldTypes.Text;
    }

    isPicklist(): boolean {
        return this.field && this.field.fieldType === FieldTypes.Picklist;
    }

    showMultiLine(): boolean {
        return this.field && this.field.fieldType === FieldTypes.Text;
    }

}
