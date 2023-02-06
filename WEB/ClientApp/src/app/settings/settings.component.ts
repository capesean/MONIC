import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';
import { ErrorService } from '../common/services/error.service';
import { SettingsService } from '../common/services/settings.service';
import { Settings } from '../common/models/settings.model';

@Component({
    selector: 'settings',
    templateUrl: './settings.component.html'
})
export class SettingsComponent implements OnInit {

    public settings: Settings = new Settings();

    constructor(
        private toastr: ToastrService,
        private settingsService: SettingsService,
        private errorService: ErrorService
    ) {
    }

    ngOnInit(): void {

        this.settingsService.get()
            .subscribe(
                settings => {
                    this.settings = settings;
                },
                err => {
                    this.errorService.handleError(err, "Settings", "Load");
                }
            );

    }

    save(form: NgForm): void {

        if (form.invalid) {

            this.toastr.error("The form has not been completed correctly.", "Form Error");
            return;

        }

        this.settingsService.save(this.settings)
            .subscribe(
                settings => {
                    this.settings = settings;
                    this.toastr.success("The settings have been saved", "Save Settings");
                },
                err => {
                    this.errorService.handleError(err, "Settings", "Save");
                }
            );

    }

}
