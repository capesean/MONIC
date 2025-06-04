import { Component, Inject, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';  
import { ErrorService } from '../common/services/error.service';
import { SetupService } from '../common/services/setup.service';
import { SetupModel } from '../common/models/setup.models';
import { DOCUMENT } from '@angular/common';

@Component({
    selector: 'setup',
    templateUrl: './setup.component.html',
    styleUrls: ['./setup.css'],
    standalone: false
})
export class SetupComponent implements OnInit {

    public setup = new SetupModel();

    constructor(
        @Inject(DOCUMENT) private document: Document,
        private toastr: ToastrService,
        private setupService: SetupService,
        private router: Router,
        private errorService: ErrorService
    ) { }

    ngOnInit() {
        this.document.body.id = "setup";
    }

    submit(form: NgForm) {

        if (form.invalid) {

            this.toastr.error("The form has not been completed correctly.");
            return;

        }

        this.setupService.runSetup(this.setup)
            .subscribe({
                next: () => {
                    this.toastr.success("Your account has been created; redirecting to the login page.", "Initialization Successful");
                    this.router.navigate(["/auth/login"]);
                },
                error: (err: HttpErrorResponse) => {
                    this.errorService.handleError(err, "App", "Setup");
                }
            });

    }
}
