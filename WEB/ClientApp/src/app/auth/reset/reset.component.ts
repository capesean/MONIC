import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';
import { AuthService } from '../../common/services/auth.service';
import { ResetModel } from '../../common/models/auth.models';
import { Router, ActivatedRoute } from '@angular/router';
import { ErrorService } from '../../common/services/error.service';

@Component({
    selector: 'reset',
    templateUrl: './reset.component.html',
    styleUrls: ['../auth.css'],
    standalone: false
})
export class ResetComponent implements OnInit {

    public reset: ResetModel = { userName: undefined, token: undefined, newPassword: undefined, confirmPassword: undefined };
    public loading = false;

    constructor(
        private toastr: ToastrService,
        private authService: AuthService,
        private route: ActivatedRoute,
        private router: Router,
        private errorService: ErrorService
    ) { }

    ngOnInit() {
        this.reset.userName = this.route.snapshot.queryParams.e;
        this.reset.token = this.route.snapshot.queryParams.t;
    }

    submit(form: NgForm) {

        if (form.invalid) {

            this.toastr.error("The form has not been completed correctly.", "Error");
            return;

        }

        if (this.reset.newPassword !== this.reset.confirmPassword) {

            this.toastr.error("The two passwords are different.", "Error");
            return;

        }

        this.loading = true;

        this.authService.reset(this.reset)
            .subscribe({
                next: () => {
                    this.toastr.success("Your password has been reset", "Reset Password");
                    this.router.navigate(['/auth/login']);
                },
                error: err => {
                    this.errorService.handleError(err, "Password", "Change");
                    this.loading = false;
                }
            });

    }

}
