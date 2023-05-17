import { Component as NgComponent, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmModalComponent, ModalOptions } from '../../common/components/confirm.component';
import { Datum } from '../../common/models/datum.model';
import { BreadcrumbService } from '../../common/services/breadcrumb.service';
import { ErrorService } from '../../common/services/error.service';
import { DatumService } from '../../common/services/datum.service';

@NgComponent({
    selector: 'datum-edit',
    templateUrl: './datum.edit.component.html'
})
export class DatumEditComponent implements OnInit {

    public datum: Datum = new Datum();
    public isNew = true;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private toastr: ToastrService,
        private breadcrumbService: BreadcrumbService,
        private modalService: NgbModal,
        private datumService: DatumService,
        private errorService: ErrorService
    ) {
    }

    ngOnInit(): void {

        this.route.params.subscribe(params => {

            const indicatorId = params["indicatorId"];
            const entityId = params["entityId"];
            const dateId = params["dateId"];
            this.isNew = indicatorId === "add" && entityId === "add" && dateId === "add";

            if (!this.isNew) {

                this.datum.indicatorId = indicatorId;
                this.datum.entityId = entityId;
                this.datum.dateId = dateId;
                this.loadDatum();

            }

        });

    }

    private loadDatum(): void {

        this.datumService.get(this.datum.indicatorId, this.datum.entityId, this.datum.dateId)
            .subscribe({
                next: datum => {
                    this.datum = datum;
                    this.changeBreadcrumb();
                },
                error: err => {
                    this.errorService.handleError(err, "Datum", "Load");
                    if (err instanceof HttpErrorResponse && err.status === 404)
                        this.router.navigate(["../../../"], { relativeTo: this.route });
                }
            });

    }

    save(form: NgForm): void {

        if (form.invalid) {

            this.toastr.error("The form has not been completed correctly.", "Form Error");
            return;

        }

        this.datumService.save(this.datum)
            .subscribe({
                next: datum => {
                    this.toastr.success("The datum has been saved", "Save Datum");
                    if (this.isNew) this.router.navigate(["../", datum.indicatorId, datum.entityId, datum.dateId], { relativeTo: this.route });
                },
                error: err => {
                    this.errorService.handleError(err, "Datum", "Save");
                }
            });

    }

    delete(): void {

        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Datum", text: "Are you sure you want to delete this datum?", deleteStyle: true, ok: "Delete" } as ModalOptions;
        modalRef.result.then(
            () => {

                this.datumService.delete(this.datum.indicatorId, this.datum.entityId, this.datum.dateId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The datum has been deleted", "Delete Datum");
                            this.router.navigate(["../../../"], { relativeTo: this.route });
                        },
                        error: err => {
                            this.errorService.handleError(err, "Datum", "Delete");
                        }
                    });

            }, () => { });
    }

    changeBreadcrumb(): void {
        this.breadcrumbService.changeBreadcrumb(this.route.snapshot, this.datum.value !== undefined ? this.datum.value.toString().substring(0, 25) : "(new datum)");
    }

}
