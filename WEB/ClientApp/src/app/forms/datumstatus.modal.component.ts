import { Component, ViewEncapsulation } from "@angular/core";
import { NgbActiveModal, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { Datum } from "../common/models/datum.model";
import { Entity } from "../common/models/entity.model";
import { Indicator } from "../common/models/indicator.model";
import { AppDate } from "../common/models/date.model";
import { DatumService } from "../common/services/datum.service";
import { ErrorService } from "../common/services/error.service";
import { EntityService } from "../common/services/entity.service";
import { FormsService } from "../common/services/forms.service";
import { DataReview } from "../common/models/datareview.model";
import { Enums, ReviewResults, ReviewStatuses } from "../common/models/enums.model";
import { ConfirmModalComponent, ConfirmModalOptions } from "../common/components/confirm.component";
import moment from "moment";

@Component({
    selector: 'app-datumstatus-modal',
    templateUrl: './datumstatus.modal.component.html',
    styleUrls: ['./datumstatus.modal.component.css'],
    encapsulation: ViewEncapsulation.None,
    standalone: false
})
export class DatumStatusModalComponent {

    public datum: Datum;
    public indicator: Indicator;
    public entity: Entity;
    public date: AppDate;
    public dataReviews: DataReview[] = [];
    public noData = false;

    constructor(
        protected modal: NgbActiveModal,
        private datumService: DatumService,
        private errorService: ErrorService,
        private entityService: EntityService,
        private formsService: FormsService,
        private modalService: NgbModal
    ) {
    }

    public setData(datum: Datum, indicator: Indicator, entity: Entity, date: AppDate) {
        this.indicator = indicator;
        this.date = date;
        this.datumService.get(indicator.indicatorId, entity.entityId, date.dateId)
            .subscribe({
                next: d => this.datum = d,
                error: err => {
                    if (err.status === 404) this.noData = true;
                    else this.errorService.handleError(err, "Datum", "Load");
                }
            });
        this.entityService.get(entity.entityId)
            .subscribe({
                next: e => this.entity = e,
                error: err => this.errorService.handleError(err, "Entity", "Load")
            });
        this.formsService.getDataReviews(datum.entityId, datum.dateId, datum.indicatorId)
            .subscribe({
                next: dataReviews => this.dataReviews = dataReviews,
                error: err => this.errorService.handleError(err, "Data Reviews", "Load")
            });
    }

    public getStatus(dataReview: DataReview): string {
        if (dataReview.reviewResult === ReviewResults.Accepted) {
            if (dataReview.reviewStatus === ReviewStatuses.Submit) return "Submitted";
            if (dataReview.reviewStatus === ReviewStatuses.Verify) return "Verified";
            if (dataReview.reviewStatus === ReviewStatuses.Approve) return "Approved";
            throw "Unknown reviewStatus in getStatus()";
        }
        if (dataReview.reviewResult === ReviewResults.Rejected) {
            if (dataReview.reviewStatus === ReviewStatuses.Verify) return "Verification Rejected";
            if (dataReview.reviewStatus === ReviewStatuses.Approve) return "Approval Rejected";
            throw "Unknown reviewStatus in getStatus()";
        }
        throw "Unknown reviewResult in getStatus()";
    }

    public showNote(dataReview: DataReview): void {
        let text = `<p class="mb-0"><strong><small>${dataReview.user.fullName} on ${moment(dataReview.dateUtc).format('DD MMM YYYY [at] HH:mm')}:</small></strong></p><div class="mb-3">${dataReview.note.replace(/(?:\r\n|\r|\n)/g, "<br>")}</div>`;

        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Note", text: text, ok: null, cancel: "Close" } as ConfirmModalOptions;
        modalRef.result.then(
            () => { },
            () => { }
        );
    }
}
