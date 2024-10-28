import { Component as NgComponent, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmModalComponent, ConfirmModalOptions } from '../../common/components/confirm.component';
import { EntityPermission } from '../../common/models/entitypermission.model';
import { BreadcrumbService } from '../../common/services/breadcrumb.service';
import { ErrorService } from '../../common/services/error.service';
import { EntityPermissionService } from '../../common/services/entitypermission.service';

@NgComponent({
    selector: 'entitypermission-edit',
    templateUrl: './entitypermission.edit.component.html'
})
export class EntityPermissionEditComponent implements OnInit {

    public entityPermission: EntityPermission = new EntityPermission();
    public isNew = true;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private toastr: ToastrService,
        private breadcrumbService: BreadcrumbService,
        private modalService: NgbModal,
        private entityPermissionService: EntityPermissionService,
        private errorService: ErrorService
    ) {
    }

    ngOnInit(): void {

        this.route.params.subscribe(params => {

            const entityPermissionId = params["entityPermissionId"];
            this.entityPermission.userId = this.route.snapshot.parent.params.id;
            this.isNew = entityPermissionId === "add";

            if (!this.isNew) {

                this.entityPermission.entityPermissionId = entityPermissionId;
                this.loadEntityPermission();

            }

        });

    }

    private loadEntityPermission(): void {

        this.entityPermissionService.get(this.entityPermission.entityPermissionId)
            .subscribe({
                next: entityPermission => {
                    this.entityPermission = entityPermission;
                    this.changeBreadcrumb();
                },
                error: err => {
                    this.errorService.handleError(err, "Entity Permission", "Load");
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

        this.entityPermissionService.save(this.entityPermission)
            .subscribe({
                next: entityPermission => {
                    this.toastr.success("The entity permission has been saved", "Save Entity Permission");
                    if (this.isNew) this.router.navigate(["../", entityPermission.entityPermissionId], { relativeTo: this.route });
                },
                error: err => {
                    this.errorService.handleError(err, "Entity Permission", "Save");
                }
            });

    }

    delete(): void {

        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Entity Permission", text: "Are you sure you want to delete this entity permission?", deleteStyle: true, ok: "Delete" } as ConfirmModalOptions;
        modalRef.result.then(
            () => {

                this.entityPermissionService.delete(this.entityPermission.entityPermissionId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The entity permission has been deleted", "Delete Entity Permission");
                            this.router.navigate(["../../"], { relativeTo: this.route });
                        },
                        error: err => {
                            this.errorService.handleError(err, "Entity Permission", "Delete");
                        }
                    });

            }, () => { });
    }

    changeBreadcrumb(): void {
        this.breadcrumbService.changeBreadcrumb(this.route.snapshot, this.entityPermission.entityId ? this.entityPermission.entity?.name?.substring(0, 25) : "(new entity permission)");
    }

}
