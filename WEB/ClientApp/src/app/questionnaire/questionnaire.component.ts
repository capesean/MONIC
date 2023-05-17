import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Questionnaire } from '../common/models/questionnaire.model';
import { BreadcrumbService } from '../common/services/breadcrumb.service';

@Component({
    selector: 'app-questionnaire',
    templateUrl: './questionnaire.component.html',
})
export class QuestionnaireComponent implements OnInit {

    public responseId: string

    constructor(
        private route: ActivatedRoute,
        private breadcrumbService: BreadcrumbService,
    ) {
    }

    ngOnInit(): void {

        this.route.params.subscribe(params => {
            this.responseId = params["responseId"];
        });

    }

    public setBreadcrumb(questionnaire: Questionnaire): void {
        this.breadcrumbService.changeBreadcrumb(this.route.snapshot, questionnaire.name);
    }

}
