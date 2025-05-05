import { Component as NgComponent, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmModalComponent, ConfirmModalOptions } from '../../common/components/confirm.component';
import { DataReview } from '../../common/models/datareview.model';
import { Enum, Enums } from '../../common/models/enums.model';
import { BreadcrumbService } from '../../common/services/breadcrumb.service';
import { ErrorService } from '../../common/services/error.service';
import { DataReviewService } from '../../common/services/datareview.service';
import moment from 'moment';

@NgComponent({
    selector: 'datareview-edit',
    templateUrl: './datareview.edit.component.html',
    standalone: false
})
export class DataReviewEditComponent implements OnInit {

    public dataReview: DataReview = new DataReview();
    public isNew = true;
    public reviewStatuses: Enum[] = Enums.ReviewStatuses;
    public reviewResults: Enum[] = Enums.ReviewResults;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private toastr: ToastrService,
        private breadcrumbService: BreadcrumbService,
        private modalService: NgbModal,
        private dataReviewService: DataReviewService,
        private errorService: ErrorService
    ) {
    }

    ngOnInit(): void {

        this.route.params.subscribe(params => {

            const dataReviewId = params["dataReviewId"];
            this.isNew = dataReviewId === "add";

            if (!this.isNew) {

                this.dataReview.dataReviewId = dataReviewId;
                this.loadDataReview();

            }

        });

    }

    private loadDataReview(): void {

        this.dataReviewService.get(this.dataReview.dataReviewId)
            .subscribe({
                next: dataReview => {
                    this.dataReview = dataReview;
                    this.changeBreadcrumb();
                },
                error: err => {
                    this.errorService.handleError(err, "Data Review", "Load");
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

        this.dataReviewService.save(this.dataReview)
            .subscribe({
                next: dataReview => {
                    this.toastr.success("The data review has been saved", "Save Data Review");
                    if (this.isNew) this.router.navigate(["../", dataReview.dataReviewId], { relativeTo: this.route });
                },
                error: err => {
                    this.errorService.handleError(err, "Data Review", "Save");
                }
            });

    }

    delete(): void {

        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Data Review", text: "Are you sure you want to delete this data review?", deleteStyle: true, ok: "Delete" } as ConfirmModalOptions;
        modalRef.result.then(
            () => {

                this.dataReviewService.delete(this.dataReview.dataReviewId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The data review has been deleted", "Delete Data Review");
                            this.router.navigate(["../"], { relativeTo: this.route });
                        },
                        error: err => {
                            this.errorService.handleError(err, "Data Review", "Delete");
                        }
                    });

            }, () => { });
    }

    changeBreadcrumb(): void {
        this.breadcrumbService.changeBreadcrumb(this.route.snapshot, this.dataReview.dateUtc ? moment(this.dataReview.dateUtc).format("LL") : "(new data review)");
    }

}
