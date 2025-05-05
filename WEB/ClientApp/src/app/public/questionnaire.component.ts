import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Date } from '../common/models/date.model';
import { Entity } from '../common/models/entity.model';
import { Enums } from '../common/models/enums.model';
import { Questionnaire } from '../common/models/questionnaire.model';
import { ErrorService } from '../common/services/error.service';
import { SurveyService } from '../common/services/survey.service';

@Component({
    selector: 'public-questionnaire',
    templateUrl: './questionnaire.component.html',
    standalone: false
})
export class QuestionnaireComponent implements OnInit {

    public publicCode: string
    public questionnaire: Questionnaire;
    public entities: Entity[];
    public dates: Date[];
    public dateTypes = Enums.DateTypes;
    public options = {
        entityId: undefined as string,
        entity: undefined as Entity,
        dateId: undefined as string,
        date: undefined as Date
    };

    constructor(
        private route: ActivatedRoute,
        private errorService: ErrorService,
        private toastr: ToastrService,
        private surveyService: SurveyService,
        private router: Router
    ) {
    }

    ngOnInit(): void {

        this.route.params.subscribe(params => {

            this.publicCode = params["publicCode"];

            this.surveyService.getQuestionnaire(this.publicCode)
                .subscribe({
                    next: o => {
                        this.questionnaire = o.questionnaire;
                        this.entities = o.entities;
                        this.dates = o.dates;
                        this.options.dateId = o.questionnaire.defaultDateId;
                    },
                    error: err => this.errorService.handleError(err, "Questionnaire", "Load")
                });

        });

    }

    start(form: NgForm): void {

        if (form.invalid) {

            this.toastr.error("The form has not been completed correctly.", "Form Error");
            return;

        }

        this.surveyService.startQuestionnaire(this.publicCode, this.options.entityId, this.options.dateId)
            .subscribe({
                next: o => {
                    this.toastr.success("The questionnaire has been started");
                    this.router.navigate(["../../response/" + o.publicCode], { relativeTo: this.route });
                },
                error: err => this.errorService.handleError(err, "Questionnaire", "Start")
            });
    }

}
