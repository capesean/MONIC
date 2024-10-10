import { Component as NgComponent, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmModalComponent, ConfirmModalOptions } from '../../common/components/confirm.component';
import { Option } from '../../common/models/option.model';
import { BreadcrumbService } from '../../common/services/breadcrumb.service';
import { ErrorService } from '../../common/services/error.service';
import { OptionService } from '../../common/services/option.service';

@NgComponent({
    selector: 'option-edit',
    templateUrl: './option.edit.component.html'
})
export class OptionEditComponent implements OnInit {

    public option: Option = new Option();
    public isNew = true;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private toastr: ToastrService,
        private breadcrumbService: BreadcrumbService,
        private modalService: NgbModal,
        private optionService: OptionService,
        private errorService: ErrorService
    ) {
    }

    ngOnInit(): void {

        this.route.params.subscribe(params => {

            const optionId = params["optionId"];
            this.option.fieldId = this.route.snapshot.parent.params.fieldId;
            this.isNew = optionId === "add";

            if (!this.isNew) {

                this.option.optionId = optionId;
                this.loadOption();

            }

        });

    }

    private loadOption(): void {

        this.optionService.get(this.option.optionId)
            .subscribe({
                next: option => {
                    this.option = option;
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

        this.optionService.save(this.option)
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

                this.optionService.delete(this.option.optionId)
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
        this.breadcrumbService.changeBreadcrumb(this.route.snapshot, this.option.name !== undefined ? this.option.name.substring(0, 25) : "(new option)");
    }

}
