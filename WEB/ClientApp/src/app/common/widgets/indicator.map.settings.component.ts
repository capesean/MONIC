import { Component as NgComponent, OnInit } from '@angular/core';
import { ErrorService } from '../services/error.service';
import { AuthService } from '../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';
import { Indicator } from '../models/indicator.model';
import { Date } from '../models/date.model';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { IndicatorService } from '../services/indicator.service';
import { DateService } from '../services/date.service';
import { Enums, WidgetTypes } from '../models/enums.model';
import { IndicatorMapSettings } from '../models/widget.model';

@NgComponent({
    selector: 'app-indicator-map-settings',
    templateUrl: './indicator.map.settings.component.html'
})
export class IndicatorMapSettingsComponent implements OnInit {

    public settings: IndicatorMapSettings;
    public dateTypes = Enums.DateTypes;
    public widgetSizes = Enums.WidgetSizes;

    public date: Date;
    public indicator: Indicator;

    constructor(
        private errorService: ErrorService,
        private toastr: ToastrService,
        private authService: AuthService,
        public modal: NgbActiveModal,
        private indicatorService: IndicatorService,
        private dateService: DateService
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

        this.settings.widgetType = WidgetTypes.IndicatorMap;

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
