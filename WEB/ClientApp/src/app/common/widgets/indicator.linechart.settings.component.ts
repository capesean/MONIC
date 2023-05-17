import { Component as NgComponent, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Entity } from '../models/entity.model';
import { Enums, WidgetTypes } from '../models/enums.model';
import { Indicator } from '../models/indicator.model';
import { IndicatorLineChartSettings } from '../models/widget.model';
import { AuthService } from '../services/auth.service';
import { EntityService } from '../services/entity.service';
import { ErrorService } from '../services/error.service';
import { IndicatorService } from '../services/indicator.service';

@NgComponent({
    selector: 'app-indicator-linechart-settings',
    templateUrl: './indicator.linechart.settings.component.html'
})
export class IndicatorLineChartSettingsComponent implements OnInit {

    public settings: IndicatorLineChartSettings;
    public widgetSizes = Enums.WidgetSizes;

    public indicator: Indicator;
    public entity: Entity;

    constructor(
        private errorService: ErrorService,
        public modal: NgbActiveModal,
        private indicatorService: IndicatorService,
        private entityService: EntityService,
        private toastr: ToastrService,
        private authService: AuthService
    ) {
    }

    ngOnInit(): void {
        if (this.settings.indicatorId)
            this.indicatorService.get(this.settings.indicatorId).subscribe(o => this.indicator = o);
        if (this.settings.entityId)
            this.entityService.get(this.settings.entityId).subscribe(o => this.entity = o);
    }

    save(form: NgForm): void {

        if (form.invalid) {

            this.toastr.error("The form has not been completed correctly.", "Form Error");
            return;

        }

        this.settings.widgetType = WidgetTypes.IndicatorLineChart;

        this.authService.saveDashboardSettings(this.settings)
            .subscribe({
                next: () => {
                    this.modal.close();
                },
                error: err => {
                    this.errorService.handleError(err, "Dashboard Settings", "Save");
                }
            });

    }
}
