import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';
import { Subject } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { BreadcrumbService } from '../../common/services/breadcrumb.service';
import { ErrorService } from '../../common/services/error.service';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmModalComponent, ConfirmModalOptions } from '../../common/components/confirm.component';
import { PagingHeaders } from '../../common/models/http.model';
import { Organisation } from '../../common/models/organisation.model';
import { OrganisationService } from '../../common/services/organisation.service';
import { Entity, EntitySearchOptions, EntitySearchResponse } from '../../common/models/entity.model';
import { EntityService } from '../../common/services/entity.service';
import { User, UserSearchOptions, UserSearchResponse } from '../../common/models/user.model';
import { UserService } from '../../common/services/user.service';
import { ItemComponent } from '../../common/components/item.component';
import { AppService } from '../../common/services/app.service';
import { Enum, Enums, ItemTypes, Roles } from '../../common/models/enums.model';
import { FadeThenShrink } from '../../common/animations/fadethenshrink';
import { DocumentService } from '../../common/services/document.service';
import { Item } from '../../common/models/item.model';
import { FieldValueMapperService } from '../../common/services/field-value-mapper.service';

@Component({
    selector: 'organisation-edit',
    templateUrl: './organisation.edit.component.html',
    animations: [FadeThenShrink],
    standalone: false
})
export class OrganisationEditComponent extends ItemComponent implements OnInit {

    public organisation: Organisation = new Organisation();
    public isNew = true;

    public entitiesSearchOptions = new EntitySearchOptions();
    public entitiesHeaders = new PagingHeaders();
    public entities: Entity[] = [];
    public showEntitiesSearch = false;

    public usersSearchOptions = new UserSearchOptions();
    public usersHeaders = new PagingHeaders();
    public users: User[] = [];
    public showUsersSearch = false;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private toastr: ToastrService,
        private breadcrumbService: BreadcrumbService,
        protected modalService: NgbModal,
        private organisationService: OrganisationService,
        private entityService: EntityService,
        private userService: UserService,
        protected errorService: ErrorService,
        protected cdref: ChangeDetectorRef,
        protected appService: AppService,
        protected documentService: DocumentService,
        protected fieldValueMapper: FieldValueMapperService
    ) {
        super(appService, errorService, cdref, documentService, modalService, fieldValueMapper);
    }

    ngOnInit(): void {

        this.route.params.subscribe(params => {

            const organisationId = params["organisationId"];
            this.isNew = organisationId === "add";

            if (!this.isNew) {

                this.organisation.organisationId = organisationId;
                this.loadOrganisation();

                this.entitiesSearchOptions.organisationId = organisationId;
                this.entitiesSearchOptions.role = Roles.Administrator;
                this.entitiesSearchOptions.includeParents = true;
                this.searchEntities();

                this.usersSearchOptions.organisationId = organisationId;
                this.usersSearchOptions.includeParents = true;
                this.searchUsers();

            }
            else {
                this.setItem(this.organisation, { itemType: ItemTypes.Organisation, itemId: this.organisation.organisationId } as Item);
            }
        });

    }

    private loadOrganisation(): void {

        this.organisationService.get(this.organisation.organisationId)
            .subscribe({
                next: organisation => {
                    this.organisation = organisation;
                    this.changeBreadcrumb();
                    this.setItem(this.organisation, { itemType: ItemTypes.Organisation, itemId: this.organisation.organisationId } as Item);
                    this.searchDocuments();
                },
                error: err => {
                    this.errorService.handleError(err, "Organisation", "Load");
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

        this.getData(this.organisation);

        this.organisationService.save(this.organisation)
            .subscribe({
                next: organisation => {
                    this.toastr.success("The organisation has been saved", "Save Organisation");
                    if (this.isNew) this.router.navigate(["../", organisation.organisationId], { relativeTo: this.route });
                    else {
                        this.organisation = organisation;
                        this.setItem(this.organisation, { itemType: ItemTypes.Organisation, itemId: this.organisation.organisationId } as Item);
                    }
                },
                error: err => {
                    this.errorService.handleError(err, "Organisation", "Save");
                }
            });

    }

    delete(): void {

        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Organisation", text: "Are you sure you want to delete this organisation?" } as ConfirmModalOptions;
        modalRef.result.then(
            () => {

                this.organisationService.delete(this.organisation.organisationId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The organisation has been deleted", "Delete Organisation");
                            this.router.navigate(["../"], { relativeTo: this.route });
                        },
                        error: err => {
                            this.errorService.handleError(err, "Organisation", "Delete");
                        }
                    });

            }, () => { });
    }

    changeBreadcrumb(): void {
        this.breadcrumbService.changeBreadcrumb(this.route.snapshot, this.organisation.name !== undefined ? this.organisation.name.substring(0, 25) : "(new organisation)");
    }

    searchEntities(pageIndex = 0): Subject<EntitySearchResponse> {

        this.entitiesSearchOptions.pageIndex = pageIndex;

        const subject = new Subject<EntitySearchResponse>()

        this.entityService.search(this.entitiesSearchOptions)
            .subscribe({
                next: response => {
                    subject.next(response);
                    this.entities = response.entities;
                    this.entitiesHeaders = response.headers;
                },
                error: err => {
                    this.errorService.handleError(err, "Entities", "Load");
                }
            });

        return subject;

    }

    goToEntity(entity: Entity): void {
        this.router.navigate(["/entities", entity.entityId]);
    }

    deleteEntity(entity: Entity, event: MouseEvent): void {
        event.stopPropagation();

        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Entity", text: "Are you sure you want to delete this entity?" } as ConfirmModalOptions;
        modalRef.result.then(
            () => {

                this.entityService.delete(entity.entityId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The entity has been deleted", "Delete Entity");
                            this.searchEntities();
                        },
                        error: err => {
                            this.errorService.handleError(err, "Entity", "Delete");
                        }
                    });

            }, () => { });
    }

    deleteEntities(): void {
        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Entity", text: "Are you sure you want to delete all the entities?" } as ConfirmModalOptions;
        modalRef.result.then(
            () => {

                this.organisationService.deleteEntities(this.organisation.organisationId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The entities have been deleted", "Delete Entities");
                            this.searchEntities();
                        },
                        error: err => {
                            this.errorService.handleError(err, "Entities", "Delete");
                        }
                    });
            }, () => { });

    }

    searchUsers(pageIndex = 0): Subject<UserSearchResponse> {

        this.usersSearchOptions.pageIndex = pageIndex;

        const subject = new Subject<UserSearchResponse>()

        this.userService.search(this.usersSearchOptions)
            .subscribe({
                next: response => {
                    subject.next(response);
                    this.users = response.users;
                    this.usersHeaders = response.headers;
                },
                error: err => {
                    this.errorService.handleError(err, "Users", "Load");
                }
            });

        return subject;

    }

    goToUser(user: User): void {
        this.router.navigate(["/users", user.id]);
    }

    deleteUser(user: User, event: MouseEvent): void {
        event.stopPropagation();

        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete User", text: "Are you sure you want to delete this user?" } as ConfirmModalOptions;
        modalRef.result.then(
            () => {

                this.userService.delete(user.id)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The user has been deleted", "Delete User");
                            this.searchUsers();
                        },
                        error: err => {
                            this.errorService.handleError(err, "User", "Delete");
                        }
                    });

            }, () => { });
    }

    deleteUsers(): void {
        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete User", text: "Are you sure you want to delete all the users?" } as ConfirmModalOptions;
        modalRef.result.then(
            () => {

                this.organisationService.deleteUsers(this.organisation.organisationId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The users have been deleted", "Delete Users");
                            this.searchUsers();
                        },
                        error: err => {
                            this.errorService.handleError(err, "Users", "Delete");
                        }
                    });
            }, () => { });

    }

}
