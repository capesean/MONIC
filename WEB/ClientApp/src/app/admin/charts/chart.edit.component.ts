import { Component as NgComponent, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmModalComponent, ConfirmModalOptions } from '../../common/components/confirm.component';
import { Chart } from '../../common/models/chart.model';
import { BreadcrumbService } from '../../common/services/breadcrumb.service';
import { ErrorService } from '../../common/services/error.service';
import { ChartService } from '../../common/services/chart.service';

@NgComponent({
    selector: 'chart-edit',
    templateUrl: './chart.edit.component.html',
    standalone: false
})
export class ChartEditComponent implements OnInit {

    public chart: Chart = new Chart();
    public isNew = true;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private toastr: ToastrService,
        private breadcrumbService: BreadcrumbService,
        private modalService: NgbModal,
        private chartService: ChartService,
        private errorService: ErrorService
    ) {
    }

    ngOnInit(): void {

        this.route.params.subscribe(params => {

            const chartId = params["chartId"];
            this.isNew = chartId === "add";

            if (!this.isNew) {

                this.chart.chartId = chartId;
                this.loadChart();

            }

        });

    }

    private loadChart(): void {

        this.chartService.get(this.chart.chartId)
            .subscribe({
                next: chart => {
                    this.chart = chart;
                    this.changeBreadcrumb();
                },
                error: err => {
                    this.errorService.handleError(err, "Chart", "Load");
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

        this.chartService.save(this.chart)
            .subscribe({
                next: chart => {
                    this.toastr.success("The chart has been saved", "Save Chart");
                    if (this.isNew) this.router.navigate(["../", chart.chartId], { relativeTo: this.route });
                },
                error: err => {
                    this.errorService.handleError(err, "Chart", "Save");
                }
            });

    }

    delete(): void {

        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Chart", text: "Are you sure you want to delete this chart?", deleteStyle: true, ok: "Delete" } as ConfirmModalOptions;
        modalRef.result.then(
            () => {

                this.chartService.delete(this.chart.chartId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The chart has been deleted", "Delete Chart");
                            this.router.navigate(["../"], { relativeTo: this.route });
                        },
                        error: err => {
                            this.errorService.handleError(err, "Chart", "Delete");
                        }
                    });

            }, () => { });
    }

    changeBreadcrumb(): void {
        this.breadcrumbService.changeBreadcrumb(this.route.snapshot, this.chart.name !== undefined ? this.chart.name.substring(0, 25) : "(new chart)");
    }

}
