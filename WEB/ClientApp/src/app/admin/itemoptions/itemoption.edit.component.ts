import { Component as NgComponent, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmModalComponent, ConfirmModalOptions } from '../../common/components/confirm.component';
import { ItemOption } from '../../common/models/itemoption.model';
import { BreadcrumbService } from '../../common/services/breadcrumb.service';
import { ErrorService } from '../../common/services/error.service';
import { ItemOptionService } from '../../common/services/itemoption.service';

@NgComponent({
    selector: 'itemoption-edit',
    templateUrl: './itemoption.edit.component.html',
    standalone: false
})
export class ItemOptionEditComponent implements OnInit {

    public itemOption: ItemOption = new ItemOption();
    public isNew = true;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private toastr: ToastrService,
        private breadcrumbService: BreadcrumbService,
        private modalService: NgbModal,
        private itemOptionService: ItemOptionService,
        private errorService: ErrorService
    ) {
    }

    ngOnInit(): void {

        this.route.params.subscribe(params => {

            const itemId = params["itemId"];
            const fieldId = params["fieldId"];
            const optionId = params["optionId"];
            this.isNew = itemId === "add" && fieldId === "add" && optionId === "add";

            if (!this.isNew) {

                this.itemOption.itemId = itemId;
                this.itemOption.fieldId = fieldId;
                this.itemOption.optionId = optionId;
                this.loadItemOption();

            }

        });

    }

    private loadItemOption(): void {

        this.itemOptionService.get(this.itemOption.itemId, this.itemOption.fieldId, this.itemOption.optionId)
            .subscribe({
                next: itemOption => {
                    this.itemOption = itemOption;
                    this.changeBreadcrumb();
                },
                error: err => {
                    this.errorService.handleError(err, "Item Option", "Load");
                    if (err instanceof HttpErrorResponse && err.status === 404)
                        this.router.navigate(["../../../"], { relativeTo: this.route });
                }
            });

    }

    save(form: NgForm): void {

        if (form.invalid) {

            this.toastr.error("The form has not been completed correctly.", "Form Error");
            return;

        }

        this.itemOptionService.save(this.itemOption)
            .subscribe({
                next: itemOption => {
                    this.toastr.success("The item option has been saved", "Save Item Option");
                    if (this.isNew) this.router.navigate(["../", itemOption.itemId, itemOption.fieldId, itemOption.optionId], { relativeTo: this.route });
                },
                error: err => {
                    this.errorService.handleError(err, "Item Option", "Save");
                }
            });

    }

    delete(): void {

        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Item Option", text: "Are you sure you want to delete this item option?", deleteStyle: true, ok: "Delete" } as ConfirmModalOptions;
        modalRef.result.then(
            () => {

                this.itemOptionService.delete(this.itemOption.itemId, this.itemOption.fieldId, this.itemOption.optionId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The item option has been deleted", "Delete Item Option");
                            this.router.navigate(["../../../"], { relativeTo: this.route });
                        },
                        error: err => {
                            this.errorService.handleError(err, "Item Option", "Delete");
                        }
                    });

            }, () => { });
    }

    changeBreadcrumb(): void {
        this.breadcrumbService.changeBreadcrumb(this.route.snapshot, this.itemOption.optionId ? this.itemOption.option?.name?.substring(0, 25) : "(new item option)");
    }

}
