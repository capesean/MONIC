import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { BreadcrumbService } from 'angular-crumbs';
import { ErrorService } from '../common/services/error.service';
import { User } from '../common/models/user.model';
import { UserService } from '../common/services/user.service';
import { Roles, Role } from '../common/models/roles.model';
import { ProfileModel } from '../common/models/profile.models';
import { ProfileService } from '../common/services/profile.service';

@Component({
    selector: 'user-edit',
    templateUrl: './user.edit.component.html'
})
export class UserEditComponent implements OnInit {

    public user: User = new User();
    public isNew = true;
    public roles: Role[] = Roles.List;
    private profile: ProfileModel;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private toastr: ToastrService,
        private breadcrumbService: BreadcrumbService,
        private userService: UserService,
        private profileService: ProfileService,
        private errorService: ErrorService
    ) {
    }

    ngOnInit(): void {

        this.profileService.getProfile().subscribe(profile => {
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

    private loadUser(): void {

        this.userService.get(this.user.id)
            .subscribe(
                user => {
                    this.user = user;
                    this.changeBreadcrumb();
                },
                err => {
                    this.errorService.handleError(err, "User", "Load");
                    if (err instanceof HttpErrorResponse && err.status === 404)
                        this.router.navigate(["../"], { relativeTo: this.route });
                }
            );

    }

    save(form: NgForm): void {

        if (form.invalid) {

            this.toastr.error("The form has not been completed correctly.", "Form Error");
            return;

        }

        this.userService.save(this.user)
            .subscribe(
                user => {
                    this.toastr.success("The user has been saved", "Save User");
                    if (this.isNew) this.router.navigate(["../", user.id], { relativeTo: this.route });
                    else {
                        // reload profile if editing self
                        if (this.user.id === this.profile.userId)
                            this.profileService.getProfile(true).subscribe();
                    }
                },
                err => {
                    this.errorService.handleError(err, "User", "Save");
                }
            );

    }

    delete(): void {

        if (!confirm("Confirm delete?")) return;

        this.userService.delete(this.user.id)
            .subscribe(
                () => {
                    this.toastr.success("The user has been deleted", "Delete User");
                    this.router.navigate(["../"], { relativeTo: this.route });
                },
                err => {
                    this.errorService.handleError(err, "User", "Delete");
                }
            );

    }

    changeBreadcrumb(): void {
        this.breadcrumbService.changeBreadcrumb(this.route.snapshot, this.user.fullName !== undefined ? this.user.fullName.substring(0, 25) : "(new user)");
    }

}
