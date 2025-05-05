import { Component as NgComponent, OnInit, ViewChild } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ErrorService } from '../common/services/error.service';
import { NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ConfirmModalComponent, ConfirmModalOptions } from '../common/components/confirm.component';
import { LogFrameRow } from '../common/models/logframerow.model';
import { LogFrameRowService } from '../common/services/logframerow.service';
import { ComponentTypes, Enum, Enums, LogFrameRowTypes } from '../common/models/enums.model';
import { LogFrame } from '../common/models/logframe.model';
import { IndicatorModalComponent } from '../admin/indicators/indicator.modal.component';
import { Indicator } from '../common/models/indicator.model';
import { LogFrameRowIndicator, LogFrameRowIndicatorSearchOptions } from '../common/models/logframerowindicator.model';
import { LogFrameRowIndicatorService } from '../common/services/logframerowindicator.service';
import { ComponentModalComponent } from '../admin/components/component.modal.component';
import { Component } from '../common/models/component.model';
import { LogFrameRowComponent } from '../common/models/logframerowcomponent.model';

@NgComponent({
    selector: 'logframe-row',
    templateUrl: './logframe.row.component.html',
    standalone: false
})
export class LogFrameRowViewComponent implements OnInit {

    @ViewChild('indicatorModal') indicatorModal: IndicatorModalComponent;
    @ViewChild('componentModal') componentsModal: ComponentModalComponent;

    public logFrame: LogFrame;
    public logFrameRow: LogFrameRow;
    public isNew = true;
    public logFrameRowTypes: Enum[] = Enums.LogFrameRowTypes;

    constructor(
        public modal: NgbActiveModal,
        private logFrameRowService: LogFrameRowService,
        private toastr: ToastrService,
        private errorService: ErrorService,
        private modalService: NgbModal
    ) {
    }

    ngOnInit(): void {
    }

    public setLogFrameRow(logFrame: LogFrame, rowType: LogFrameRowTypes, logFrameRow: LogFrameRow) {
        this.logFrame = logFrame;
        if (logFrameRow == undefined) {
            this.logFrameRow = new LogFrameRow();
            this.logFrameRow.rowType = rowType;
            this.logFrameRow.logFrameId = logFrame.logFrameId;
            this.logFrameRow.logFrameRowIndicators = [];
            this.logFrameRow.logFrameRowComponents = [];
        } else {
            this.isNew = false;
            // clone to avoid cancelled changes affecting source page
            this.logFrameRow = { ...logFrameRow };
            this.logFrameRow.logFrameRowIndicators = [...logFrameRow.logFrameRowIndicators];
            this.logFrameRow.logFrameRowComponents = [...logFrameRow.logFrameRowComponents];
        }
    }

    save(form: NgForm): void {

        if (form.invalid) {

            this.toastr.error("The form has not been completed correctly.", "Form Error");
            return;

        }

        this.logFrameRowService.save(this.logFrameRow, true)
            .subscribe({
                next: lfr => {
                    this.toastr.success("The LogFrame Row has been saved", "Save LogFrame Row");
                    this.modal.close(lfr);
                },
                error: err => {
                    this.errorService.handleError(err, "LogFrame Row", "Save");
                }
            });

    }

    delete(): void {

        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete LogFrame Row", text: "Are you sure you want to delete this LogFrame Row?", deleteStyle: true, ok: "Delete" } as ConfirmModalOptions;
        modalRef.result.then(
            () => {

                this.logFrameRowService.delete(this.logFrameRow.logFrameRowId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The LogFrame Row has been deleted", "Delete LogFrame Row");
                            this.modal.close("deleted");
                        },
                        error: err => {
                            this.errorService.handleError(err, "LogFrame Row", "Delete");
                        }
                    });

            }, () => { });

    }

    addLogFrameRowIndicators(): void {
        this.indicatorModal.open();
    }

    changeIndicators(indicators: Indicator[]): void {
        indicators.forEach(indicator => {
            if (this.logFrameRow.logFrameRowIndicators.findIndex(o => o.indicatorId === indicator.indicatorId) < 0) {

                this.logFrameRow.logFrameRowIndicators.push({ indicator: indicator, indicatorId: indicator.indicatorId, logFrameRowId: this.logFrameRow.logFrameRowId } as LogFrameRowIndicator)
            }
        });
    }

    deleteLogFrameRowIndicator(logFrameRowIndicator: LogFrameRowIndicator, event: MouseEvent): void {
        event.stopPropagation();

        this.logFrameRow.logFrameRowIndicators.splice(this.logFrameRow.logFrameRowIndicators.findIndex(o => o.indicatorId === logFrameRowIndicator.indicatorId), 1);
    }

    deleteLogFrameRowIndicators(): void {
        while (this.logFrameRow.logFrameRowIndicators.length)
            this.logFrameRow.logFrameRowIndicators.pop();
    }

    addLogFrameRowComponents(): void {
        let componentType: ComponentTypes = undefined;
        if (this.logFrameRow.rowType === LogFrameRowTypes.Activities) componentType = ComponentTypes.Activity;
        else if (this.logFrameRow.rowType === LogFrameRowTypes.Outputs) componentType = ComponentTypes.Output;
        else if (this.logFrameRow.rowType === LogFrameRowTypes.Outcomes) componentType = ComponentTypes.Outcome;
        else if (this.logFrameRow.rowType === LogFrameRowTypes.Goals) componentType = ComponentTypes.Impact;
        if (componentType === undefined) throw "Invalid componentType in addLogFrameRowComponents";
        this.componentsModal.componentType = Enums.ComponentTypes[componentType];
        this.componentsModal.open();
    }

    changeComponents(components: Component[]): void {
        components.forEach(component => {
            if (this.logFrameRow.logFrameRowComponents.findIndex(o => o.componentId === component.componentId) < 0)
                this.logFrameRow.logFrameRowComponents.push({ component: component, componentId: component.componentId, logFrameRowId: this.logFrameRow.logFrameRowId } as LogFrameRowComponent)
        });
    }

    deleteLogFrameRowComponent(logFrameRowComponents: LogFrameRowComponent, event: MouseEvent): void {
        event.stopPropagation();

        this.logFrameRow.logFrameRowComponents.splice(this.logFrameRow.logFrameRowComponents.findIndex(o => o.componentId === logFrameRowComponents.componentId), 1);
    }

    deleteLogFrameRowComponents(): void {
        while (this.logFrameRow.logFrameRowComponents.length)
            this.logFrameRow.logFrameRowComponents.pop();
    }

}
