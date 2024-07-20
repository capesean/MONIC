import { Component, OnInit, Inject } from '@angular/core'
import { DOCUMENT } from '@angular/common';
import { Router } from '@angular/router';
import { ErrorService } from '../common/services/error.service';
import { AppService } from '../common/services/app.service';

@Component({
    selector: 'auth-root',
    templateUrl: './auth.component.html'
})
export class AuthComponent implements OnInit {

    constructor(
        @Inject(DOCUMENT) private document: Document,
        private appService: AppService,
        private router: Router,
        private errorService: ErrorService
    ) { }

    ngOnInit(): void {
        this.document.body.id = "auth";
        this.appService.setupCheck().subscribe({
            next: response => {
                if (!response.setupCompleted) this.router.navigate(["/setup"]);
            },
            error: err => {
                if (err.status !== 0) this.errorService.handleError(err, "Settings", "Load");
            }
        });
    }

}
