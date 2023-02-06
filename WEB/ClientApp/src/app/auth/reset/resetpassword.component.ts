import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';
import { AuthService } from '../../common/services/auth.service';
import { ResetPasswordModel } from '../../common/models/auth.models';
import { Router } from '@angular/router';
import { ErrorService } from '../../common/services/error.service';

@Component({
    selector: 'resetpassword',
    templateUrl: './resetpassword.component.html',
    styleUrls: ['../auth.css'],
})
export class ResetPasswordComponent implements OnInit {

    public resetPassword: ResetPasswordModel = { userName: undefined };

    constructor(
        private toastr: ToastrService,
        private authService: AuthService,
        private router: Router,
        private errorService: ErrorService
    ) { }

    ngOnInit() {
    }

    submit(form: NgForm) {

        if (form.invalid) {

            this.toastr.error("The form has not been completed correctly.", "Error");
            return;

        }

        this.authService.resetPassword(this.resetPassword)
            .subscribe(
                () => {
                    this.toastr.success("A password reset mail has been sent", "Reset Password");
                    this.router.navigate(['/auth/login']);
                },
                err => {
                    this.errorService.handleError(err, "Password", "Change");
                }
            );

    }

}
