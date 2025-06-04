import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Settings } from '../common/models/settings.model';
import { AppService } from '../common/services/app.service';
import { ErrorService } from '../common/services/error.service';
import { SettingsService } from '../common/services/settings.service';

@Component({
    selector: 'settings-edit',
    templateUrl: './settings.edit.component.html',
    standalone: false
})
export class SettingsEditComponent implements OnInit {

    public settings: Settings = new Settings();

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private toastr: ToastrService,
        private appService: AppService,
        private settingsService: SettingsService,
        private errorService: ErrorService
    ) {
    }

    ngOnInit(): void {

        this.loadSettings();

    }

    private loadSettings(): void {

        this.settingsService.get()
            .subscribe({
                next: settings => {
                    this.settings = settings;
                },
                error: err => {
                    this.errorService.handleError(err, "Settings", "Load");
                    if (err instanceof HttpErrorResponse && err.status === 404)
                        this.router.navigate(["../"], { relativeTo: this.route });
                }
            });

    }

    save(form: NgForm): void {

        if (form.invalid) {

            this.toastr.error("The form has not been completed correctly.", "Form Error");
            return;

        }

        this.settingsService.save(this.settings)
            .subscribe({
                next: settings => {
                    this.toastr.success("The settings has been saved", "Save Settings");
                    this.appService.getAppSettings(true).subscribe(); // refresh the appSettings
                },
                error: err => {
                    this.errorService.handleError(err, "Settings", "Save");
                }
            });

    }

}
