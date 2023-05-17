import { Component, ViewEncapsulation } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { ErrorService } from "../common/services/error.service";
import { IndicatorRow } from "../common/models/dataentry.model";
import { Enums, ReviewResults, ReviewStatuses } from "../common/models/enums.model";
import { Entity } from "../common/models/entity.model";
import { Date } from "../common/models/date.model";
import { FormsService } from "../common/services/forms.service";
import { ToastrService } from "ngx-toastr";

@Component({
    selector: 'app-datareview-modal',
    templateUrl: './datareview.modal.html',
    styleUrls: ['./datareview.modal.css'],
    encapsulation: ViewEncapsulation.None
})
export class DataReviewModalComponent {

    public title: string;
    public verb = "";
    public indicatorRows: IndicatorRow[] = [];
    public entity: Entity;
    public date: Date;
    public status: ReviewStatuses;
    public result: ReviewResults;
    public rejectionNote: string = null;

    constructor(
        protected modal: NgbActiveModal,
        private errorService: ErrorService,
        private formsService: FormsService,
        private toastr: ToastrService
    ) {
    }

    public setData(indicatorRows: IndicatorRow[], status: ReviewStatuses, result: ReviewResults, entity: Entity, date: Date) {

        this.title = `${(result === ReviewResults.Rejected ? "Reject" : Enums.ReviewStatuses[status].label)} Data`;

        this.indicatorRows = indicatorRows;
        this.status = status;
        this.result = result;
        this.entity = entity;
        this.date = date;

        if (result === ReviewResults.Rejected) this.verb = "Reject";
        else this.verb = Enums.ReviewStatuses[status].label;
    }

    accept(): void {

        if (this.status === ReviewStatuses.Submit) {

            this.formsService.submitDataEntry(
                this.entity.entityId,
                this.date.dateId,
                this.indicatorRows.map(o => o.indicator.indicatorId)
            ).subscribe({
                next: data => {
                    this.modal.close(data);
                    this.toastr.success("The data have been submitted", "Submit Data");
                },
                error: err => this.errorService.handleError(err, "Data", "Submit")
            });

        } else if (this.status === ReviewStatuses.Verify) {

            this.formsService.verifyDataEntry(
                this.entity.entityId,
                this.date.dateId,
                this.indicatorRows.map(o => o.indicator.indicatorId)
            ).subscribe({
                next: data => {
                    this.modal.close(data);
                    this.toastr.success("The data have been verified", "Verify Data");
                },
                error: err => this.errorService.handleError(err, "Data", "Verify")
            });

        } else if (this.status === ReviewStatuses.Approve) {

            this.formsService.approveDataEntry(
                this.entity.entityId,
                this.date.dateId,
                this.indicatorRows.map(o => o.indicator.indicatorId)
            ).subscribe({
                next: data => {
                    this.modal.close(data);
                    this.toastr.success("The data have been approved", "Approve Data");
                },
                error: err => this.errorService.handleError(err, "Data", "Approve")
            });

        } else {
            throw "Invalid status in accept()";
        }
    }

    reject(): void {

        if (!(this.rejectionNote ?? "").trim()) {
            this.toastr.error("You need to provide a rejection note", "Reject Data");
            return;
        }

        this.formsService.rejectDataEntry(
            this.entity.entityId,
            this.date.dateId,
            this.indicatorRows.map(o => o.indicator.indicatorId),
            this.status,
            this.rejectionNote
        ).subscribe({
            next: data => {
                this.modal.close(data);
                this.toastr.success("The data have been rejected", "Reject Data");
            },
            error: err => this.errorService.handleError(err, "Data", "Reject")
        });
    }

}
