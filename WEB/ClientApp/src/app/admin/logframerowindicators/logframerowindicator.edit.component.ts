import { Component as NgComponent, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmModalComponent, ModalOptions } from '../../common/components/confirm.component';
import { LogFrameRowIndicator } from '../../common/models/logframerowindicator.model';
import { BreadcrumbService } from '../../common/services/breadcrumb.service';
import { ErrorService } from '../../common/services/error.service';
import { LogFrameRowIndicatorService } from '../../common/services/logframerowindicator.service';

@NgComponent({
    selector: 'logframerowindicator-edit',
    templateUrl: './logframerowindicator.edit.component.html'
})
export class LogFrameRowIndicatorEditComponent implements OnInit {

    public logFrameRowIndicator: LogFrameRowIndicator = new LogFrameRowIndicator();
    public isNew = true;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private toastr: ToastrService,
        private breadcrumbService: BreadcrumbService,
        private modalService: NgbModal,
        private logFrameRowIndicatorService: LogFrameRowIndicatorService,
        private errorService: ErrorService
    ) {
    }

    ngOnInit(): void {

        this.route.params.subscribe(params => {

            const indicatorId = params["indicatorId"];
            this.logFrameRowIndicator.logFrameRowId = this.route.snapshot.parent.params.logFrameRowId;
            this.isNew = indicatorId === "add";

            if (!this.isNew) {

                this.logFrameRowIndicator.indicatorId = indicatorId;
                this.loadLogFrameRowIndicator();

            }

        });

    }

    private loadLogFrameRowIndicator(): void {

        this.logFrameRowIndicatorService.get(this.logFrameRowIndicator.logFrameRowId, this.logFrameRowIndicator.indicatorId)
            .subscribe({
                next: logFrameRowIndicator => {
                    this.logFrameRowIndicator = logFrameRowIndicator;
                    this.changeBreadcrumb();
                },
                error: err => {
                    this.errorService.handleError(err, "Log Frame Row Indicator", "Load");
                    if (err instanceof HttpErrorResponse && err.status === 404)
                        this.router.navigate(["../../"], { relativeTo: this.route });
                }
            });

    }

    save(form: NgForm): void {

        if (form.invalid) {

            this.toastr.error("The form has not been completed correctly.", "Form Error");
            return;

        }

        this.logFrameRowIndicatorService.save(this.logFrameRowIndicator)
            .subscribe({
                next: logFrameRowIndicator => {
                    this.toastr.success("The log frame row indicator has been saved", "Save Log Frame Row Indicator");
                    if (this.isNew) this.router.navigate(["../", logFrameRowIndicator.indicatorId], { relativeTo: this.route });
                },
                error: err => {
                    this.errorService.handleError(err, "Log Frame Row Indicator", "Save");
                }
            });

    }

    delete(): void {

        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Log Frame Row Indicator", text: "Are you sure you want to delete this log frame row indicator?", deleteStyle: true, ok: "Delete" } as ModalOptions;
        modalRef.result.then(
            () => {

                this.logFrameRowIndicatorService.delete(this.logFrameRowIndicator.logFrameRowId, this.logFrameRowIndicator.indicatorId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The log frame row indicator has been deleted", "Delete Log Frame Row Indicator");
                            this.router.navigate(["../../"], { relativeTo: this.route });
                        },
                        error: err => {
                            this.errorService.handleError(err, "Log Frame Row Indicator", "Delete");
                        }
                    });

            }, () => { });
    }

    changeBreadcrumb(): void {
        this.breadcrumbService.changeBreadcrumb(this.route.snapshot, this.logFrameRowIndicator.indicatorId ? this.logFrameRowIndicator.indicator?.name?.substring(0, 25) : "(new log frame row indicator)");
    }

}
