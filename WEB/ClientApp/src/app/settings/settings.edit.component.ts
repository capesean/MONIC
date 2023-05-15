import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmModalComponent, ModalOptions } from '../common/components/confirm.component';
import { Settings } from '../common/models/settings.model';
import { BreadcrumbService } from '../common/services/breadcrumb.service';
import { ErrorService } from '../common/services/error.service';
import { SettingsService } from '../common/services/settings.service';

@Component({
    selector: 'settings-edit',
    templateUrl: './settings.edit.component.html'
})
export class SettingsEditComponent implements OnInit {

    public settings: Settings = new Settings();
    public isNew = true;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private toastr: ToastrService,
        private breadcrumbService: BreadcrumbService,
        private modalService: NgbModal,
        private settingsService: SettingsService,
        private errorService: ErrorService
    ) {
    }

    ngOnInit(): void {

        this.route.params.subscribe(params => {

            const id = params["id"];
            this.isNew = id === "add";

            if (!this.isNew) {

                this.settings.id = id;
                this.loadSettings();

            }

        });

    }

    private loadSettings(): void {

        this.settingsService.get(this.settings.id)
            .subscribe({
                next: settings => {
                    this.settings = settings;
                    this.changeBreadcrumb();
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
                    if (this.isNew) this.router.navigate(["../", settings.id], { relativeTo: this.route });
                },
                error: err => {
                    this.errorService.handleError(err, "Settings", "Save");
                }
            });

    }

    delete(): void {

        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Settings", text: "Are you sure you want to delete this settings?", deleteStyle: true, ok: "Delete" } as ModalOptions;
        modalRef.result.then(
            () => {

                this.settingsService.delete(this.settings.id)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The settings has been deleted", "Delete Settings");
                            this.router.navigate(["../"], { relativeTo: this.route });
                        },
                        error: err => {
                            this.errorService.handleError(err, "Settings", "Delete");
                        }
                    });

            }, () => { });
    }

    changeBreadcrumb(): void {
        this.breadcrumbService.changeBreadcrumb(this.route.snapshot, this.settings.id !== undefined ? this.settings.id.substring(0, 25) : "(new settings)");
    }

}
