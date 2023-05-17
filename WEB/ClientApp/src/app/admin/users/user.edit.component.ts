import { Component as NgComponent, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmModalComponent, ModalOptions } from '../../common/components/confirm.component';
import { PagingHeaders } from '../../common/models/http.model';
import { User } from '../../common/models/user.model';
import { Enum, Enums, Roles } from '../../common/models/enums.model';
import { ProfileModel } from '../../common/models/profile.models';
import { AuthService } from '../../common/services/auth.service';
import { BreadcrumbService } from '../../common/services/breadcrumb.service';
import { ErrorService } from '../../common/services/error.service';
import { UserService } from '../../common/services/user.service';
import { EntityPermission, EntityPermissionSearchOptions, EntityPermissionSearchResponse } from '../../common/models/entitypermission.model';
import { EntityPermissionService } from '../../common/services/entitypermission.service';
import { IndicatorPermission, IndicatorPermissionSearchOptions, IndicatorPermissionSearchResponse } from '../../common/models/indicatorpermission.model';
import { IndicatorPermissionService } from '../../common/services/indicatorpermission.service';
import { EntityModalComponent } from '../entities/entity.modal.component';
import { Entity } from '../../common/models/entity.model';
import { environment } from '../../../environments/environment';
import { AddIndicatorsPermissionModal } from './addindicatorpermissions.modal';

@NgComponent({
    selector: 'user-edit',
    templateUrl: './user.edit.component.html'
})
export class UserEditComponent implements OnInit, OnDestroy {

    public environment = environment;
    public user: User = new User();
    public isNew = true;
    private routerSubscription: Subscription;
    public roles: Enum[] = Enums.Roles;
    private profile: ProfileModel;

    public entityPermissionsSearchOptions = new EntityPermissionSearchOptions();
    public entityPermissionsHeaders = new PagingHeaders();
    public entityPermissions: EntityPermission[] = [];
    public showEntityPermissionsSearch = false;

    public indicatorPermissionsSearchOptions = new IndicatorPermissionSearchOptions();
    public indicatorPermissionsHeaders = new PagingHeaders();
    public indicatorPermissions: IndicatorPermission[] = [];
    public showIndicatorPermissionsSearch = false;

    @ViewChild('entityModal') entityModal: EntityModalComponent;

    constructor(
        private router: Router,
        public route: ActivatedRoute,
        private toastr: ToastrService,
        private breadcrumbService: BreadcrumbService,
        private modalService: NgbModal,
        private userService: UserService,
        private entityPermissionService: EntityPermissionService,
        private indicatorPermissionService: IndicatorPermissionService,
        private authService: AuthService,
        private errorService: ErrorService
    ) {
    }

    ngOnInit(): void {

        this.authService.getProfile().subscribe(profile => {
            this.profile = profile;
        });

        this.route.params.subscribe(params => {

            const id = params["id"];
            this.isNew = id === "add";

            if (!this.isNew) {

                this.user.id = id;
                this.loadUser();

                this.entityPermissionsSearchOptions.userId = id;
                this.entityPermissionsSearchOptions.includeParents = true;
                this.searchEntityPermissions();

                this.indicatorPermissionsSearchOptions.userId = id;
                this.indicatorPermissionsSearchOptions.includeParents = true;
                this.searchIndicatorPermissions();

            }

            this.routerSubscription = this.router.events.subscribe(event => {
                if (event instanceof NavigationEnd && !this.route.firstChild) {
                    this.searchIndicatorPermissions();
                    // this will double-load on new save, as params change (above) + nav ends
                    this.searchEntityPermissions();
                }
            });

        });

    }

    ngOnDestroy(): void {
        this.routerSubscription.unsubscribe();
    }

    private loadUser(): void {

        this.userService.get(this.user.id)
            .subscribe({
                next: user => {
                    this.user = user;
                    this.changeBreadcrumb();
                },
                error: err => {
                    this.errorService.handleError(err, "User", "Load");
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

        this.userService.save(this.user)
            .subscribe({
                next: user => {
                    this.toastr.success("The user has been saved", "Save User");
                    if (this.isNew) {
                        this.ngOnDestroy();
                        this.router.navigate(["../", user.id], { relativeTo: this.route });
                    }
                    else {
                        this.searchEntityPermissions();
                        this.searchIndicatorPermissions();
                        // reload profile if editing self
                        if (this.user.id === this.profile.userId)
                            this.authService.getProfile(true).subscribe();
                    }
                },
                error: err => {
                    this.errorService.handleError(err, "User", "Save");
                }
            });

    }

    delete(): void {

        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete User", text: "Are you sure you want to delete this user?", deleteStyle: true, ok: "Delete" } as ModalOptions;
        modalRef.result.then(
            () => {

                this.userService.delete(this.user.id)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The user has been deleted", "Delete User");
                            this.router.navigate(["../"], { relativeTo: this.route });
                        },
                        error: err => {
                            this.errorService.handleError(err, "User", "Delete");
                        }
                    });

            }, () => { });
    }

    changeBreadcrumb(): void {
        this.breadcrumbService.changeBreadcrumb(this.route.snapshot, this.user.fullName !== undefined ? this.user.fullName.substring(0, 25) : "(new user)");
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
        this.router.navigate(["entitypermissions", entityPermission.entityPermissionId], { relativeTo: this.route });
    }

    addEntityPermissions(): void {
        this.entityModal.open();
    }

    changeEntity(entities: Entity[]): void {
        if (!entities.length) return;
        const entityIdList = entities.map(o => o.entityId);
        this.userService.saveEntityPermissions(this.user.id, entityIdList)
            .subscribe({
                next: () => {
                    this.toastr.success("The entity permissions have been saved", "Save Entity Permissions");
                    this.searchEntityPermissions(this.entityPermissionsHeaders.pageIndex);
                },
                error: err => {
                    this.errorService.handleError(err, "Entity Permissions", "Save");
                }
            });
    }

    deleteEntityPermission(entityPermission: EntityPermission, event: MouseEvent): void {
        event.stopPropagation();

        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Entity Permission", text: "Are you sure you want to delete this entity permission?", deleteStyle: true, ok: "Delete" } as ModalOptions;
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
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Entity Permissions", text: "Are you sure you want to delete all the entity permissions?", deleteStyle: true, ok: "Delete" } as ModalOptions;
        modalRef.result.then(
            () => {

                this.userService.deleteEntityPermissions(this.user.id)
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

    searchIndicatorPermissions(pageIndex = 0): Subject<IndicatorPermissionSearchResponse> {

        this.indicatorPermissionsSearchOptions.pageIndex = pageIndex;

        const subject = new Subject<IndicatorPermissionSearchResponse>()

        this.indicatorPermissionService.search(this.indicatorPermissionsSearchOptions)
            .subscribe({
                next: response => {
                    subject.next(response);
                    this.indicatorPermissions = response.indicatorPermissions;
                    this.indicatorPermissionsHeaders = response.headers;
                },
                error: err => {
                    this.errorService.handleError(err, "Indicator Permissions", "Load");
                }
            });

        return subject;

    }

    goToUserIndicatorPermission(indicatorPermission: IndicatorPermission): void {
        this.router.navigate(['indicatorpermissions', indicatorPermission.indicatorPermissionId], { relativeTo: this.route });
    }

    addIndicatorPermissions(): void {
        let modalRef = this.modalService.open(AddIndicatorsPermissionModal, { size: 'xl', centered: true });
        (modalRef.componentInstance as AddIndicatorsPermissionModal).setUser(this.user);
        modalRef.result.then(
            () => {

                this.searchIndicatorPermissions();

            },
            () => { }
        );
    }

    saveIndicatorPermission(indicatorPermission: IndicatorPermission): void {
        this.indicatorPermissionService.save(indicatorPermission)
            .subscribe({
                next: () => this.toastr.success("The permission has been updated"),
                error: err => {
                    this.errorService.handleError(err, "Indicator Permission", "Save");
                    this.searchIndicatorPermissions(this.indicatorPermissionsHeaders.pageIndex);
                }
            });
    }

    isOversight(): boolean {
        return !!this.user.roles.find(o => o === Enums.Roles[Roles.Oversight].name);
    }

    changeRoles(): void {
        if (!this.isOversight()) {
            this.user.affiliatedEntityId = undefined;
            this.user.entity = undefined;
        } else {
            this.user.organisation = undefined;
            this.user.organisationId = undefined;
        }
    }

    deleteIndicatorPermission(indicatorPermission: IndicatorPermission, event: MouseEvent): void {
        event.stopPropagation();

        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Indicator Permission", text: "Are you sure you want to delete this indicator permission?", deleteStyle: true, ok: "Delete" } as ModalOptions;
        modalRef.result.then(
            () => {

                this.indicatorPermissionService.delete(indicatorPermission.indicatorPermissionId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The indicator permission has been deleted", "Delete Indicator Permission");
                            this.searchIndicatorPermissions(this.indicatorPermissionsHeaders.pageIndex);
                        },
                        error: err => {
                            this.errorService.handleError(err, "Indicator Permission", "Delete");
                        }
                    });

            }, () => { });
    }

    deleteIndicatorPermissions(): void {
        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Indicator Permissions", text: "Are you sure you want to delete all the indicator permissions?", deleteStyle: true, ok: "Delete" } as ModalOptions;
        modalRef.result.then(
            () => {

                this.userService.deleteIndicatorPermissions(this.user.id)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The indicator permissions have been deleted", "Delete Indicator Permissions");
                            this.searchIndicatorPermissions();
                        },
                        error: err => {
                            this.errorService.handleError(err, "Indicator Permissions", "Delete");
                        }
                    });
            }, () => { });

    }

}
