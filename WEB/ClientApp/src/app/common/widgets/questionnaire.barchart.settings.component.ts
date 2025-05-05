import { Component as NgComponent, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Date } from '../models/date.model';
import { Entity, EntitySearchOptions } from '../models/entity.model';
import { DateTypes, Enum, Enums, WidgetTypes } from '../models/enums.model';
import { Questionnaire } from '../models/questionnaire.model';
import { QuestionnaireBarChartSettings } from '../models/widget.model';
import { AuthService } from '../services/auth.service';
import { DateService } from '../services/date.service';
import { EntityService } from '../services/entity.service';
import { ErrorService } from '../services/error.service';
import { QuestionnaireService } from '../services/questionnaire.service';

@NgComponent({
    selector: 'app-questionnaire-barchart-settings',
    templateUrl: './questionnaire.barchart.settings.component.html',
    standalone: false
})
export class QuestionnaireBarChartSettingsComponent implements OnInit {

    public settings: QuestionnaireBarChartSettings;
    public dateTypes = Enums.DateTypes;
    public widgetSizes = Enums.WidgetSizes;

    public questionnaire: Questionnaire;
    public date: Date;
    public entities: Entity[] = [];

    constructor(
        private errorService: ErrorService,
        public modal: NgbActiveModal,
        private questionnaireService: QuestionnaireService,
        private dateService: DateService,
        private entityService: EntityService,
        private toastr: ToastrService,
        private authService: AuthService
    ) {
    }

    ngOnInit(): void {
        if (this.settings.questionnaireId)
            this.questionnaireService.get(this.settings.questionnaireId).subscribe(o => this.questionnaire = o);
        if (this.settings.dateId)
            this.dateService.get(this.settings.dateId).subscribe(o => this.date = o);
        if (this.settings.entityIds && this.settings.entityIds.length) {
            this.entityService.search({ pageSize: 0, entityIds: this.settings.entityIds } as EntitySearchOptions)
                .subscribe({
                    next: o => this.entities = o.entities,
                    error: err => console.log(err)
                });
        }
    }

    save(form: NgForm): void {

        if (form.invalid) {

            this.toastr.error("The form has not been completed correctly.", "Form Error");
            return;

        }

        this.settings.widgetType = WidgetTypes.QuestionnaireBarChart;

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

    getDateType(): Enum {
        if (this.questionnaire) return Enums.DateTypes[this.questionnaire.dateType];
        return undefined;
    }
}
