import { Component as NgComponent, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { AppDate } from '../models/date.model';
import { Enums, WidgetTypes } from '../models/enums.model';
import { IndicatorPieChartSettings } from '../models/widget.model';
import { AuthService } from '../services/auth.service';
import { DateService } from '../services/date.service';
import { ErrorService } from '../services/error.service';

@NgComponent({
    selector: 'app-indicator-piechart-settings',
    templateUrl: './indicator.piechart.settings.component.html',
    standalone: false
})
export class IndicatorPieChartSettingsComponent implements OnInit {

    public settings: IndicatorPieChartSettings;
    public widgetSizes = Enums.WidgetSizes;

    public date: AppDate;

    constructor(
        private errorService: ErrorService,
        public modal: NgbActiveModal,
        private dateService: DateService,
        private toastr: ToastrService,
        private authService: AuthService
    ) {
    }

    ngOnInit(): void {
        if (this.settings.dateId)
            this.dateService.get(this.settings.dateId).subscribe(o => this.date = o);
    }

    save(form: NgForm): void {

        if (form.invalid) {

            this.toastr.error("The form has not been completed correctly.", "Form Error");
            return;

        }

        this.settings.widgetType = WidgetTypes.IndicatorPieChart;

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
