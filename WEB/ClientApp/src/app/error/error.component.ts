import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ErrorService } from '../common/services/error.service';
import { Error, Exception } from '../common/models/error.model';
import { BreadcrumbService } from '../common/services/breadcrumb.service';
import moment from 'moment';

@Component({
    selector: 'error',
    templateUrl: './error.component.html',
    standalone: false
})
export class ErrorComponent implements OnInit {

    public error: Error = new Error();
    public exceptions: Exception[] = [];

    constructor(
        private route: ActivatedRoute,
        private errorService: ErrorService,
        private breadcrumbService: BreadcrumbService
    ) {
    }

    ngOnInit(): void {

        this.route.params.subscribe(params => {

            let id = params["id"];
            this.errorService.get(id)
                .subscribe({
                    next: error => {
                        this.error = error;
                        this.breadcrumbService.changeBreadcrumb(this.route.snapshot, moment(this.error.dateUtc).format('DD MMM YYYY HH:mm:SS'));
                        this.exceptions = [];
                        if (error.exception) {
                            this.exceptions.push(error.exception);
                            this.addInnerExceptions(error.exception);
                        }
                    },
                    error: err => {
                        this.errorService.handleError(err, "Error", "Load");
                    }
                });

        });

    }

    private addInnerExceptions(exception: Exception): void {
        if (exception.innerException) {
            this.exceptions.push(exception.innerException);
            this.addInnerExceptions(exception.innerException);
        }
    }

}
