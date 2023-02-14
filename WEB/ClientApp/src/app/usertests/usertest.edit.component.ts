import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmModalComponent, ModalOptions } from '../common/components/confirm.component';
import { UserTest } from '../common/models/usertest.model';
import { BreadcrumbService } from '../common/services/breadcrumb.service';
import { ErrorService } from '../common/services/error.service';
import { UserTestService } from '../common/services/usertest.service';

@Component({
    selector: 'usertest-edit',
    templateUrl: './usertest.edit.component.html'
})
export class UserTestEditComponent implements OnInit {

    public userTest: UserTest = new UserTest();
    public isNew = true;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private toastr: ToastrService,
        private breadcrumbService: BreadcrumbService,
        private modalService: NgbModal,
        private userTestService: UserTestService,
        private errorService: ErrorService
    ) {
    }

    ngOnInit(): void {

        this.route.params.subscribe(params => {

            const userTestId = params["userTestId"];
            this.userTest.userId = this.route.snapshot.parent.params.id;
            this.isNew = userTestId === "add";

            if (!this.isNew) {

                this.userTest.userTestId = userTestId;
                this.loadUserTest();

            }

        });

    }

    private loadUserTest(): void {

        this.userTestService.get(this.userTest.userTestId)
            .subscribe(
                userTest => {
                    this.userTest = userTest;
                    this.changeBreadcrumb();
                },
                err => {
                    this.errorService.handleError(err, "User Test", "Load");
                    if (err instanceof HttpErrorResponse && err.status === 404)
                        this.router.navigate(["../../"], { relativeTo: this.route });
                }
            );

    }

    save(form: NgForm): void {

        if (form.invalid) {

            this.toastr.error("The form has not been completed correctly.", "Form Error");
            return;

        }

        this.userTestService.save(this.userTest)
            .subscribe(
                userTest => {
                    this.toastr.success("The user test has been saved", "Save User Test");
                    if (this.isNew) this.router.navigate(["../", userTest.userTestId], { relativeTo: this.route });
                },
                err => {
                    this.errorService.handleError(err, "User Test", "Save");
                }
            );

    }

    delete(): void {

        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete User Test", text: "Are you sure you want to delete this user test?", deleteStyle: true, ok: "Delete" } as ModalOptions;
        modalRef.result.then(
            () => {

                this.userTestService.delete(this.userTest.userTestId)
                    .subscribe(
                        () => {
                            this.toastr.success("The user test has been deleted", "Delete User Test");
                            this.router.navigate(["../../"], { relativeTo: this.route });
                        },
                        err => {
                            this.errorService.handleError(err, "User Test", "Delete");
                        }
                    );

        }, () => { });
    }

    changeBreadcrumb(): void {
        this.breadcrumbService.changeBreadcrumb(this.route.snapshot, this.userTest.name !== undefined ? this.userTest.name.substring(0, 25) : "(new user test)");
    }

}
