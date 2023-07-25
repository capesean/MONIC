import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmModalComponent, ModalOptions } from '../common/components/confirm.component';
import { User } from '../common/models/user.model';
import { Enum, Enums, Roles } from '../common/models/enums.model';
import { ProfileModel } from '../common/models/profile.models';
import { AuthService } from '../common/services/auth.service';
import { BreadcrumbService } from '../common/services/breadcrumb.service';
import { ErrorService } from '../common/services/error.service';
import { UserService } from '../common/services/user.service';

@Component({
    selector: 'user-edit',
    templateUrl: './user.edit.component.html'
})
export class UserEditComponent implements OnInit, OnDestroy {

    public user: User = new User();
    public isNew = true;
    private routerSubscription: Subscription;
    public roles: Enum[] = Enums.Roles;
    private profile: ProfileModel;

    constructor(
        private router: Router,
        public route: ActivatedRoute,
        private toastr: ToastrService,
        private breadcrumbService: BreadcrumbService,
        private modalService: NgbModal,
        private userService: UserService,
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

            }

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

}
