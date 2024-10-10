import { Component as NgComponent, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';
import { Subject } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmModalComponent, ConfirmModalOptions } from '../../common/components/confirm.component';
import { PagingHeaders } from '../../common/models/http.model';
import { Entity } from '../../common/models/entity.model';
import { BreadcrumbService } from '../../common/services/breadcrumb.service';
import { ErrorService } from '../../common/services/error.service';
import { EntityService } from '../../common/services/entity.service';
import { EntityLink, EntityLinkSearchOptions, EntityLinkSearchResponse } from '../../common/models/entitylink.model';
import { EntityLinkService } from '../../common/services/entitylink.service';
import { EntityPermission, EntityPermissionSearchOptions, EntityPermissionSearchResponse } from '../../common/models/entitypermission.model';
import { EntityPermissionService } from '../../common/services/entitypermission.service';
import { Response, ResponseSearchOptions, ResponseSearchResponse } from '../../common/models/response.model';
import { ResponseService } from '../../common/services/response.service';
import { EntityModalComponent } from '../entities/entity.modal.component';
import { ItemTypes, Roles } from '../../common/models/enums.model';
import { AppService } from '../../common/services/app.service';
import { ItemComponent } from '../../common/components/item.component';
import { DocumentService } from '../../common/services/document.service';
import { Item } from '../../common/models/item.model';

@NgComponent({
    selector: 'entity-edit',
    templateUrl: './entity.edit.component.html'
})
export class EntityEditComponent extends ItemComponent implements OnInit {

    public entity: Entity = new Entity();
    public isNew = true;

    public entityPermissionsSearchOptions = new EntityPermissionSearchOptions();
    public entityPermissionsHeaders = new PagingHeaders();
    public entityPermissions: EntityPermission[] = [];
    public showEntityPermissionsSearch = false;

    public parentEntitiesSearchOptions = new EntityLinkSearchOptions();
    public parentEntitiesHeaders = new PagingHeaders();
    public parentEntities: EntityLink[] = [];
    public showParentEntitiesSearch = false;

    public responsesSearchOptions = new ResponseSearchOptions();
    public responsesHeaders = new PagingHeaders();
    public responses: Response[] = [];
    public showResponsesSearch = false;

    public childEntitiesSearchOptions = new EntityLinkSearchOptions();
    public childEntitiesHeaders = new PagingHeaders();
    public childEntities: EntityLink[] = [];
    public showChildEntitiesSearch = false;

    public showDocumentsSearch = false;

    public admin = Roles.Administrator;

    @ViewChild('entityModal') entityModal: EntityModalComponent;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private toastr: ToastrService,
        private breadcrumbService: BreadcrumbService,
        protected  modalService: NgbModal,
        private entityService: EntityService,
        private entityLinkService: EntityLinkService,
        private entityPermissionService: EntityPermissionService,
        private responseService: ResponseService,
        protected errorService: ErrorService,
        protected cdref: ChangeDetectorRef,
        protected appService: AppService,
        protected documentService: DocumentService
    ) {
        super(appService, errorService, cdref, documentService, modalService);
    }

    ngOnInit(): void {

        this.route.params.subscribe(params => {

            const entityId = params["entityId"];
            this.isNew = entityId === "add";

            if (!this.isNew) {

                this.entity.entityId = entityId;
                this.loadEntity();

                this.entityPermissionsSearchOptions.entityId = entityId;
                this.entityPermissionsSearchOptions.includeParents = true;
                this.searchEntityPermissions();

                this.parentEntitiesSearchOptions.childEntityId = entityId;
                this.parentEntitiesSearchOptions.includeParents = true;
                this.searchParentEntities();

                this.responsesSearchOptions.entityId = entityId;
                this.responsesSearchOptions.includeParents = true;
                this.searchResponses();

                this.childEntitiesSearchOptions.parentEntityId = entityId;
                this.childEntitiesSearchOptions.includeParents = true;
                this.searchChildEntities();
            }
            else {
                this.setItem(this.entity, { itemType: ItemTypes.Entity, itemId: this.entity.entityId } as Item);
            }

        });

    }

    private loadEntity(): void {

        this.entityService.get(this.entity.entityId, Roles.Administrator)
            .subscribe({
                next: entity => {
                    this.entity = entity;
                    this.changeBreadcrumb();
                    this.setItem(this.entity, { itemType: ItemTypes.Entity, itemId: this.entity.entityId } as Item);
                    this.searchDocuments();
                },
                error: err => {
                    this.errorService.handleError(err, "Entity", "Load");
                    if (err instanceof HttpErrorResponse && err.status === 404)
                        this.router.navigate(["../"], { relativeTo: this.route });
                }
            });

    }

    save(form: NgForm): void {

        this.updateValueAndValidity(form);

        if (form.invalid) {

            this.toastr.error("The form has not been completed correctly.", "Form Error");
            return;

        }

        this.getData(this.entity);

        this.entityService.save(this.entity)
            .subscribe({
                next: entity => {
                    this.toastr.success("The entity has been saved", "Save Entity");
                    if (this.isNew) this.router.navigate(["../", entity.entityId], { relativeTo: this.route });
                    else this.setItem(this.entity, { itemType: ItemTypes.Entity, itemId: this.entity.entityId } as Item);
                },
                error: err => {
                    this.errorService.handleError(err, "Entity", "Save");
                }
            });

    }

    delete(): void {

        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Entity", text: "Are you sure you want to delete this entity?", deleteStyle: true, ok: "Delete" } as ConfirmModalOptions;
        modalRef.result.then(
            () => {

                this.entityService.delete(this.entity.entityId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The entity has been deleted", "Delete Entity");
                            this.router.navigate(["../"], { relativeTo: this.route });
                        },
                        error: err => {
                            this.errorService.handleError(err, "Entity", "Delete");
                        }
                    });

            }, () => { });
    }

    changeBreadcrumb(): void {
        this.breadcrumbService.changeBreadcrumb(this.route.snapshot, this.entity.name !== undefined ? this.entity.name.substring(0, 25) : "(new entity)");
    }

    searchEntityPermissions(pageIndex = 0): Subject<EntityPermissionSearchResponse> {

        this.entityPermissionsSearchOptions.pageIndex = pageIndex;

        const subject = new Subject<EntityPermissionSearchResponse>()

        this.entityPermissionService.search(this.entityPermissionsSearchOptions)
            .subscribe({
                next: response => {
                    subject.next(response);
                    this.entityPermissions = response.entityPermissions;
                    this.entityPermissionsHeaders = response.headers;
                },
                error: err => {
                    this.errorService.handleError(err, "Entity Permissions", "Load");
                }
            });

        return subject;

    }

    goToEntityPermission(entityPermission: EntityPermission): void {
        this.router.navigate(["/users", entityPermission.user.id, "entitypermissions", entityPermission.entityPermissionId]);
    }

    deleteEntityPermission(entityPermission: EntityPermission, event: MouseEvent): void {
        event.stopPropagation();

        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Entity Permission", text: "Are you sure you want to delete this entity permission?", deleteStyle: true, ok: "Delete" } as ConfirmModalOptions;
        modalRef.result.then(
            () => {

                this.entityPermissionService.delete(entityPermission.entityPermissionId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The entity permission has been deleted", "Delete Entity Permission");
                            this.searchEntityPermissions(this.entityPermissionsHeaders.pageIndex);
                        },
                        error: err => {
                            this.errorService.handleError(err, "Entity Permission", "Delete");
                        }
                    });

            }, () => { });
    }

    deleteEntityPermissions(): void {
        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Entity Permissions", text: "Are you sure you want to delete all the entity permissions?", deleteStyle: true, ok: "Delete" } as ConfirmModalOptions;
        modalRef.result.then(
            () => {

                this.entityService.deleteEntityPermissions(this.entity.entityId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The entity permissions have been deleted", "Delete Entity Permissions");
                            this.searchEntityPermissions();
                        },
                        error: err => {
                            this.errorService.handleError(err, "Entity Permissions", "Delete");
                        }
                    });
            }, () => { });

    }

    searchParentEntities(pageIndex = 0): Subject<EntityLinkSearchResponse> {

        this.parentEntitiesSearchOptions.pageIndex = pageIndex;

        const subject = new Subject<EntityLinkSearchResponse>()

        this.entityLinkService.search(this.parentEntitiesSearchOptions)
            .subscribe({
                next: response => {
                    subject.next(response);
                    this.parentEntities = response.entityLinks;
                    this.parentEntitiesHeaders = response.headers;
                },
                error: err => {
                    this.errorService.handleError(err, "Aggregation Parents", "Load");
                }
            });

        return subject;

    }

    goToEntityLink(entityLink: EntityLink): void {
        this.router.navigate(["/entitylinks", entityLink.childEntityId, entityLink.parentEntityId]);
    }

    addParentEntity(): void {
        this.entityModal.open();
    }

    changeEntity(entity: Entity): void {
        //entities: Entity[]): void {
        alert("disabled: todo: fix required")
        //if (!entities.length) return;
        //const entityIdList = entities.map(o => o.entityId);
        //this.entityService.saveEntityLinks(this.entity.entityId, entityIdList)
        //    .subscribe({
        //        next: () => {
        //            this.toastr.success("The entity links have been saved", "Save Entity Links");
        //            this.searchParentEntities(this.parentEntitiesHeaders.pageIndex);
        //        },
        //        error: err => {
        //            this.errorService.handleError(err, "Entity Links", "Save");
        //        }
        //    });
    }

    deleteParentEntity(entityLink: EntityLink, event: MouseEvent): void {
        event.stopPropagation();

        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Entity Link", text: "Are you sure you want to delete this entity link?", deleteStyle: true, ok: "Delete" } as ConfirmModalOptions;
        modalRef.result.then(
            () => {

                this.entityLinkService.delete(entityLink.childEntityId, entityLink.parentEntityId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The entity link has been deleted", "Delete Entity Link");
                            this.searchParentEntities(this.parentEntitiesHeaders.pageIndex);
                        },
                        error: err => {
                            this.errorService.handleError(err, "Entity Link", "Delete");
                        }
                    });

            }, () => { });
    }

    searchChildEntities(pageIndex = 0): Subject<EntityLinkSearchResponse> {

        this.childEntitiesSearchOptions.pageIndex = pageIndex;

        const subject = new Subject<EntityLinkSearchResponse>()

        this.entityLinkService.search(this.childEntitiesSearchOptions)
            .subscribe({
                next: response => {
                    subject.next(response);
                    this.childEntities = response.entityLinks;
                    this.childEntitiesHeaders = response.headers;
                },
                error: err => {
                    this.errorService.handleError(err, "Child Entities", "Load");
                }
            });

        return subject;

    }

    setDisabled(value: boolean): void {

        const verb = value ? "Disable" : "Enable";

        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: `${verb} entity`, text: `Are you sure you want to ${verb.toLowerCase()} this entity?\n\n(All child entities will also be ${verb}d)` } as ConfirmModalOptions;
        modalRef.result.then(
            () => {

                this.entityService.setDisabled(this.entity.entityId, value)
                    .subscribe({
                        next: () => {
                            this.toastr.success(`The entity link has been ${verb}d`, (value ? "Disable" : "Enable") + "Entity");
                            this.entity.disabled = value;
                        },
                        error: err => {
                            this.errorService.handleError(err, "Entity", "Change Disabled State");
                        }
                    });

            }, () => { });

    }

    searchResponses(pageIndex = 0): Subject<ResponseSearchResponse> {

        this.responsesSearchOptions.pageIndex = pageIndex;

        const subject = new Subject<ResponseSearchResponse>()

        this.responseService.search(this.responsesSearchOptions)
            .subscribe({
                next: response => {
                    subject.next(response);
                    this.responses = response.responses;
                    this.responsesHeaders = response.headers;
                },
                error: err => {
                    this.errorService.handleError(err, "Responses", "Load");
                }
            });

        return subject;

    }

    goToResponse(response: Response): void {
        this.router.navigate(["/questionnaires", response.questionnaire.questionnaireId, "responses", response.responseId]);
    }

    deleteResponse(response: Response, event: MouseEvent): void {
        event.stopPropagation();

        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Response", text: "Are you sure you want to delete this response?", deleteStyle: true, ok: "Delete" } as ConfirmModalOptions;
        modalRef.result.then(
            () => {

                this.responseService.delete(response.responseId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The response has been deleted", "Delete Response");
                            this.searchResponses(this.responsesHeaders.pageIndex);
                        },
                        error: err => {
                            this.errorService.handleError(err, "Response", "Delete");
                        }
                    });

            }, () => { });
    }

    deleteResponses(): void {
        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Responses", text: "Are you sure you want to delete all the responses?", deleteStyle: true, ok: "Delete" } as ConfirmModalOptions;
        modalRef.result.then(
            () => {

                this.entityService.deleteResponses(this.entity.entityId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The responses have been deleted", "Delete Responses");
                            this.searchResponses();
                        },
                        error: err => {
                            this.errorService.handleError(err, "Responses", "Delete");
                        }
                    });
            }, () => { });

    }

}
