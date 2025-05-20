import { Component as NgComponent, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmModalComponent, ConfirmModalOptions } from '../../common/components/confirm.component';
import { ItemField } from '../../common/models/itemfield.model';
import { BreadcrumbService } from '../../common/services/breadcrumb.service';
import { ErrorService } from '../../common/services/error.service';
import { ItemFieldService } from '../../common/services/itemfield.service';

@NgComponent({
    selector: 'itemfield-edit',
    templateUrl: './itemfield.edit.component.html',
    standalone: false
})
export class ItemFieldEditComponent implements OnInit {

    public itemField: ItemField = new ItemField();
    public isNew = true;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private toastr: ToastrService,
        private breadcrumbService: BreadcrumbService,
        private modalService: NgbModal,
        private itemFieldService: ItemFieldService,
        private errorService: ErrorService
    ) {
    }

    ngOnInit(): void {

        this.route.params.subscribe(params => {

            const itemId = params["itemId"];
            const fieldId = params["fieldId"];
            this.isNew = itemId === "add" && fieldId === "add";

            if (!this.isNew) {

                this.itemField.itemId = itemId;
                this.itemField.fieldId = fieldId;
                this.loadItemField();

            }

        });

    }

    private loadItemField(): void {

        this.itemFieldService.get(this.itemField.itemId, this.itemField.fieldId)
            .subscribe({
                next: itemField => {
                    this.itemField = itemField;
                    this.changeBreadcrumb();
                },
                error: err => {
                    this.errorService.handleError(err, "Item Field", "Load");
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

        this.itemFieldService.save(this.itemField)
            .subscribe({
                next: itemField => {
                    this.toastr.success("The item field has been saved", "Save Item Field");
                    if (this.isNew) this.router.navigate(["../", itemField.itemId, itemField.fieldId], { relativeTo: this.route });
                },
                error: err => {
                    this.errorService.handleError(err, "Item Field", "Save");
                }
            });

    }

    delete(): void {

        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Item Field", text: "Are you sure you want to delete this item field?", deleteStyle: true, ok: "Delete" } as ConfirmModalOptions;
        modalRef.result.then(
            () => {

                this.itemFieldService.delete(this.itemField.itemId, this.itemField.fieldId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The item field has been deleted", "Delete Item Field");
                            this.router.navigate(["../../"], { relativeTo: this.route });
                        },
                        error: err => {
                            this.errorService.handleError(err, "Item Field", "Delete");
                        }
                    });

            }, () => { });
    }

    changeBreadcrumb(): void {
        this.breadcrumbService.changeBreadcrumb(this.route.snapshot, this.itemField.fieldId ? this.itemField.field?.name?.substring(0, 25) : "(new item field)");
    }

}
