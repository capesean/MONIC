import { Component as NgComponent, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmModalComponent, ModalOptions } from '../../common/components/confirm.component';
import { EntityLink } from '../../common/models/entitylink.model';
import { BreadcrumbService } from '../../common/services/breadcrumb.service';
import { ErrorService } from '../../common/services/error.service';
import { EntityLinkService } from '../../common/services/entitylink.service';

@NgComponent({
    selector: 'entitylink-edit',
    templateUrl: './entitylink.edit.component.html'
})
export class EntityLinkEditComponent implements OnInit {

    public entityLink: EntityLink = new EntityLink();
    public isNew = true;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private toastr: ToastrService,
        private breadcrumbService: BreadcrumbService,
        private modalService: NgbModal,
        private entityLinkService: EntityLinkService,
        private errorService: ErrorService
    ) {
    }

    ngOnInit(): void {

        this.route.params.subscribe(params => {

            const childEntityId = params["childEntityId"];
            const parentEntityId = params["parentEntityId"];
            this.isNew = childEntityId === "add" && parentEntityId === "add";

            if (!this.isNew) {

                this.entityLink.childEntityId = childEntityId;
                this.entityLink.parentEntityId = parentEntityId;
                this.loadEntityLink();

            }

        });

    }

    private loadEntityLink(): void {

        this.entityLinkService.get(this.entityLink.childEntityId, this.entityLink.parentEntityId)
            .subscribe({
                next: entityLink => {
                    this.entityLink = entityLink;
                    this.changeBreadcrumb();
                },
                error: err => {
                    this.errorService.handleError(err, "Entity Link", "Load");
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

        this.entityLinkService.save(this.entityLink)
            .subscribe({
                next: entityLink => {
                    this.toastr.success("The entity link has been saved", "Save Entity Link");
                    if (this.isNew) this.router.navigate(["../", entityLink.childEntityId, entityLink.parentEntityId], { relativeTo: this.route });
                },
                error: err => {
                    this.errorService.handleError(err, "Entity Link", "Save");
                }
            });

    }

    delete(): void {

        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Entity Link", text: "Are you sure you want to delete this entity link?", deleteStyle: true, ok: "Delete" } as ModalOptions;
        modalRef.result.then(
            () => {

                this.entityLinkService.delete(this.entityLink.childEntityId, this.entityLink.parentEntityId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The entity link has been deleted", "Delete Entity Link");
                            this.router.navigate(["../../"], { relativeTo: this.route });
                        },
                        error: err => {
                            this.errorService.handleError(err, "Entity Link", "Delete");
                        }
                    });

            }, () => { });
    }

    changeBreadcrumb(): void {
        this.breadcrumbService.changeBreadcrumb(this.route.snapshot, this.entityLink.childEntityId ? this.entityLink.childEntity?.name?.substring(0, 25) : "(new entity link)");
    }

}
