import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { BreadcrumbService } from '../common/services/breadcrumb.service';
import { ErrorService } from '../common/services/error.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmModalComponent, ModalOptions } from '../common/components/confirm.component';
import { PagingHeaders } from '../common/models/http.model';
import { User } from '../common/models/user.model';
import { UserService } from '../common/services/user.service';
import { UserTest, UserTestSearchOptions, UserTestSearchResponse } from '../common/models/usertest.model';
import { UserTestService } from '../common/services/usertest.service';
import { Enum, Enums, Roles } from '../common/models/enums.model';
import { ProfileModel } from '../common/models/profile.models';
import { AuthService } from '../common/services/auth.service';
import { UserTestSortComponent } from '../usertests/usertest.sort.component';

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

    private userTestsSearchOptions = new UserTestSearchOptions();
    public userTestsHeaders = new PagingHeaders();
    public userTests: UserTest[] = [];

    constructor(
        private router: Router,
        public route: ActivatedRoute,
        private toastr: ToastrService,
        private breadcrumbService: BreadcrumbService,
        private modalService: NgbModal,
        private userService: UserService,
        private userTestService: UserTestService,
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

                this.userTestsSearchOptions.userId = id;
                this.userTestsSearchOptions.includeParents = true;
                this.loadUserTests();

            }

            this.routerSubscription = this.router.events.subscribe(event => {
                if (event instanceof NavigationEnd && !this.route.firstChild) {
                    // this will double-load on new save, as params change (above) + nav ends
                    this.loadUserTests();
                }
            });

        });

    }

    ngOnDestroy(): void {
        this.routerSubscription.unsubscribe();
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
                err => {
                    this.errorService.handleError(err, "User", "Save");
                }
            );

    }

    delete(): void {

        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete User", text: "Are you sure you want to delete this user?", deleteStyle: true, ok: "Delete" } as ModalOptions;
        modalRef.result.then(
            () => {

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

        }, () => { });
    }

    changeBreadcrumb(): void {
        this.breadcrumbService.changeBreadcrumb(this.route.snapshot, this.user.fullName !== undefined ? this.user.fullName.substring(0, 25) : "(new user)");
    }

    loadUserTests(pageIndex = 0): Subject<UserTestSearchResponse> {

        this.userTestsSearchOptions.pageIndex = pageIndex;

        const subject = new Subject<UserTestSearchResponse>()

        this.userTestService.search(this.userTestsSearchOptions)
            .subscribe(
                response => {
                    subject.next(response);
                    this.userTests = response.userTests;
                    this.userTestsHeaders = response.headers;
                },
                err => {
                    this.errorService.handleError(err, "User Tests", "Load");
                }
            );

        return subject;

    }

    goToUserTest(userTest: UserTest): void {
        this.router.navigate(["usertests", userTest.userTestId], { relativeTo: this.route });
    }

    deleteUserTest(userTest: UserTest, event: MouseEvent): void {
        event.stopPropagation();

        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete User Test", text: "Are you sure you want to delete this user test?", deleteStyle: true, ok: "Delete" } as ModalOptions;
        modalRef.result.then(
            () => {

                this.userTestService.delete(userTest.userTestId)
                    .subscribe(
                        () => {
                            this.toastr.success("The user test has been deleted", "Delete User Test");
                            this.loadUserTests(this.userTestsHeaders.pageIndex);
                        },
                        err => {
                            this.errorService.handleError(err, "User Test", "Delete");
                        }
                    );

            }, () => { });
    }

    deleteUserTests(): void {
        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete User Tests", text: "Are you sure you want to delete all the user tests?", deleteStyle: true, ok: "Delete" } as ModalOptions;
        modalRef.result.then(
            () => {

                this.userService.deleteUserTests(this.user.id)
                    .subscribe(
                        () => {
                            this.toastr.success("The user tests have been deleted", "Delete User Tests");
                            this.loadUserTests();
                        },
                        err => {
                            this.errorService.handleError(err, "User Tests", "Delete");
                        }
                    );
            }, () => { });

    }

    showUserTestSort() {
        let modalRef = this.modalService.open(UserTestSortComponent, { size: 'xl', centered: true, scrollable: false });
        (modalRef.componentInstance as UserTestSortComponent).userId = this.user.id;
        modalRef.result.then(
            () => this.loadUserTests(this.userTestsHeaders.pageIndex),
            () => { }
        );
    }

}
