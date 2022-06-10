import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';
import { AuthService } from '../../common/services/auth.service';
import { LoginModel } from '../../common/models/auth.models';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { ErrorService } from '../../common/services/error.service';
import { HttpErrorResponse } from '@angular/common/http';  

@Component({
    selector: 'login',
    templateUrl: './login.component.html',
    styleUrls: ['../auth.css'],
})
export class LoginComponent implements OnInit {

    public login: LoginModel = { username: undefined, password: undefined };
    private params: Params;

    constructor(
        private toastr: ToastrService,
        private authService: AuthService,
        private router: Router,
        private errorService: ErrorService,
        private route: ActivatedRoute
    ) { }

    ngOnInit() {
        this.route.queryParams.subscribe(params => {
            this.params = params;
        });
    }

    submit(form: NgForm) {

        if (form.invalid) {

            this.toastr.error("The form has not been completed correctly.");
            return;

        }

        this.authService.login(this.login)
            .subscribe(
                () => {
                    this.router.navigate([this.params.path ? decodeURIComponent(this.params.path) : "/"]);
                },
                (err: HttpErrorResponse) => {
                    this.errorService.handleError(err, "User", "Login");
                }
            );

    }

}
