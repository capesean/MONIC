import { Component, OnInit, Inject } from '@angular/core'
import { DOCUMENT } from '@angular/common';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { SetupService } from '../common/services/setup.service';

@Component({
    selector: 'auth-root',
    templateUrl: './auth.component.html'
})
export class AuthComponent implements OnInit {

    constructor(
        @Inject(DOCUMENT) private document: Document,
        private setupService: SetupService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.document.body.id = "auth";

        if (environment.runSetupCheck) {
            this.setupService.checkSetup()
                .subscribe(
                    setup => {
                        if (setup.runSetup) this.router.navigate(["/setup"]);
                    }
                );
        }
    }

}
