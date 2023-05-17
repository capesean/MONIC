import { Component as NgComponent, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Date } from '../models/date.model';
import { Enums, WidgetTypes } from '../models/enums.model';
import { Indicator } from '../models/indicator.model';
import { IndicatorBarChartSettings } from '../models/widget.model';
import { AuthService } from '../services/auth.service';
import { DateService } from '../services/date.service';
import { ErrorService } from '../services/error.service';
import { IndicatorService } from '../services/indicator.service';

@NgComponent({
    selector: 'app-indicator-barchart-settings',
    templateUrl: './indicator.barchart.settings.component.html'
})
export class IndicatorBarChartSettingsComponent implements OnInit {

    public settings: IndicatorBarChartSettings;
    public dateTypes = Enums.DateTypes;
    public widgetSizes = Enums.WidgetSizes;

    public indicator: Indicator;
    public date: Date;

    constructor(
        private errorService: ErrorService,
        public modal: NgbActiveModal,
        private indicatorService: IndicatorService,
        private dateService: DateService,
        private toastr: ToastrService,
        private authService: AuthService
    ) {
    }

    ngOnInit(): void {
        if (this.settings.indicatorId)
            this.indicatorService.get(this.settings.indicatorId).subscribe(o => this.indicator = o);
        if (this.settings.dateId)
            this.dateService.get(this.settings.dateId).subscribe(o => this.date = o);
    }

    save(form: NgForm): void {

        if (form.invalid) {

            this.toastr.error("The form has not been completed correctly.", "Form Error");
            return;

        }

        this.settings.widgetType = WidgetTypes.IndicatorBarChart;

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
