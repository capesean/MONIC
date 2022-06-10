import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ErrorService } from '../../common/services/error.service';
import { Error, Exception } from '../../common/models/error.model';

@Component({
    selector: 'error',
    templateUrl: './error.component.html'
})
export class ErrorComponent implements OnInit {

    public error: Error = new Error();
    public exceptions: Exception[] = [];

    constructor(
        private route: ActivatedRoute,
        private errorService: ErrorService
    ) {
    }

    ngOnInit(): void {

        this.route.params.subscribe(params => {

            let id = params["id"];
            this.errorService.get(id)
                .subscribe(
                    error => {
                        this.error = error;
                        this.exceptions = [];
                        if (error.exception) {
                            this.exceptions.push(error.exception);
                            this.addInnerExceptions(error.exception);
                        }
                    },
                    err => {
                        this.errorService.handleError(err, "Error", "Load");
                    }
                );

        });

    }

    private addInnerExceptions(exception: Exception): void {
        if (exception.innerException) {
            this.exceptions.push(exception.innerException);
            this.addInnerExceptions(exception.innerException);
        }
    }

}
