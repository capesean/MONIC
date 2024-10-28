import { Component as NgComponent, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmModalComponent, ConfirmModalOptions } from '../../common/components/confirm.component';
import { IndicatorPermission } from '../../common/models/indicatorpermission.model';
import { BreadcrumbService } from '../../common/services/breadcrumb.service';
import { ErrorService } from '../../common/services/error.service';
import { IndicatorPermissionService } from '../../common/services/indicatorpermission.service';

@NgComponent({
    selector: 'indicatorpermission-edit',
    templateUrl: './indicatorpermission.edit.component.html'
})
export class IndicatorPermissionEditComponent implements OnInit {

    public indicatorPermission: IndicatorPermission = new IndicatorPermission();
    public isNew = true;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private toastr: ToastrService,
        private breadcrumbService: BreadcrumbService,
        private modalService: NgbModal,
        private indicatorPermissionService: IndicatorPermissionService,
        private errorService: ErrorService
    ) {
    }

    ngOnInit(): void {

        this.route.params.subscribe(params => {

            const indicatorPermissionId = params["indicatorPermissionId"];
            this.isNew = indicatorPermissionId === "add";

            if (!this.isNew) {

                this.indicatorPermission.indicatorPermissionId = indicatorPermissionId;
                this.loadIndicatorPermission();

            }

        });

    }

    private loadIndicatorPermission(): void {

        this.indicatorPermissionService.get(this.indicatorPermission.indicatorPermissionId)
            .subscribe({
                next: indicatorPermission => {
                    this.indicatorPermission = indicatorPermission;
                    this.changeBreadcrumb();
                },
                error: err => {
                    this.errorService.handleError(err, "Indicator Permission", "Load");
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

        this.indicatorPermissionService.save(this.indicatorPermission)
            .subscribe({
                next: indicatorPermission => {
                    this.toastr.success("The indicator permission has been saved", "Save Indicator Permission");
                    if (this.isNew) this.router.navigate(["../", indicatorPermission.indicatorPermissionId], { relativeTo: this.route });
                },
                error: err => {
                    this.errorService.handleError(err, "Indicator Permission", "Save");
                }
            });

    }

    delete(): void {

        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Indicator Permission", text: "Are you sure you want to delete this indicator permission?", deleteStyle: true, ok: "Delete" } as ConfirmModalOptions;
        modalRef.result.then(
            () => {

                this.indicatorPermissionService.delete(this.indicatorPermission.indicatorPermissionId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The indicator permission has been deleted", "Delete Indicator Permission");
                            this.router.navigate(["../"], { relativeTo: this.route });
                        },
                        error: err => {
                            this.errorService.handleError(err, "Indicator Permission", "Delete");
                        }
                    });

            }, () => { });
    }

    changeBreadcrumb(): void {
        this.breadcrumbService.changeBreadcrumb(this.route.snapshot, this.indicatorPermission.indicatorPermissionId !== undefined ? this.indicatorPermission.indicatorPermissionId.substring(0, 25) : "(new indicator permission)");
    }

}
