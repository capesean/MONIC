import { Component as NgComponent, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmModalComponent, ConfirmModalOptions } from '../../common/components/confirm.component';
import { IndicatorDate } from '../../common/models/indicatordate.model';
import { BreadcrumbService } from '../../common/services/breadcrumb.service';
import { ErrorService } from '../../common/services/error.service';
import { IndicatorDateService } from '../../common/services/indicatordate.service';

@NgComponent({
    selector: 'indicatordate-edit',
    templateUrl: './indicatordate.edit.component.html',
    standalone: false
})
export class IndicatorDateEditComponent implements OnInit {

    public indicatorDate: IndicatorDate = new IndicatorDate();
    public isNew = true;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private toastr: ToastrService,
        private breadcrumbService: BreadcrumbService,
        private modalService: NgbModal,
        private indicatorDateService: IndicatorDateService,
        private errorService: ErrorService
    ) {
    }

    ngOnInit(): void {

        this.route.params.subscribe(params => {

            const dateId = params["dateId"];
            this.indicatorDate.indicatorId = this.route.snapshot.parent.params.indicatorId;
            this.isNew = dateId === "add";

            if (!this.isNew) {

                this.indicatorDate.dateId = dateId;
                this.loadIndicatorDate();

            }

        });

    }

    private loadIndicatorDate(): void {

        this.indicatorDateService.get(this.indicatorDate.indicatorId, this.indicatorDate.dateId)
            .subscribe({
                next: indicatorDate => {
                    this.indicatorDate = indicatorDate;
                    this.changeBreadcrumb();
                },
                error: err => {
                    this.errorService.handleError(err, "Indicator Date", "Load");
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

        this.indicatorDateService.save(this.indicatorDate)
            .subscribe({
                next: indicatorDate => {
                    this.toastr.success("The indicator date has been saved", "Save Indicator Date");
                    if (this.isNew) this.router.navigate(["../", indicatorDate.dateId], { relativeTo: this.route });
                },
                error: err => {
                    this.errorService.handleError(err, "Indicator Date", "Save");
                }
            });

    }

    delete(): void {

        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Indicator Date", text: "Are you sure you want to delete this indicator date?", deleteStyle: true, ok: "Delete" } as ConfirmModalOptions;
        modalRef.result.then(
            () => {

                this.indicatorDateService.delete(this.indicatorDate.indicatorId, this.indicatorDate.dateId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The indicator date has been deleted", "Delete Indicator Date");
                            this.router.navigate(["../../"], { relativeTo: this.route });
                        },
                        error: err => {
                            this.errorService.handleError(err, "Indicator Date", "Delete");
                        }
                    });

            }, () => { });
    }

    changeBreadcrumb(): void {
        this.breadcrumbService.changeBreadcrumb(this.route.snapshot, this.indicatorDate.dateId ? this.indicatorDate.date?.name?.substring(0, 25) : "(new indicator date)");
    }

}
