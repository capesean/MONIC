import { Component as NgComponent, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ExportModel, QuestionnaireService } from '../../common/services/questionnaire.service';
import { Questionnaire } from '../../common/models/questionnaire.model';
import { ErrorService } from '../../common/services/error.service';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';
import { Enum, Enums } from '../../common/models/enums.model';

@NgComponent({
    selector: 'questionnaire-export',
    templateUrl: './questionnaire.export.component.html'
})
export class QuestionnaireExportComponent implements OnInit {

    public questionnaire: Questionnaire;
    public options = new ExportModel();
    public dateTypes: Enum[] = Enums.DateTypes;

    constructor(
        public modal: NgbActiveModal,
        private questionnaireService: QuestionnaireService,
        private toastr: ToastrService,
        private errorService: ErrorService
    ) {
    }

    ngOnInit(): void {
        this.options.questionnaireId = this.questionnaire.questionnaireId;
    }

    submit(form: NgForm) {

        if (form.invalid) {

            this.toastr.error("The form has not been completed correctly.", "Form Error");
            return;

        }

        if (this.options.includeCharts && this.options.dateIds.length !== 1) {

            this.toastr.error("Charts can only be included if exactly 1 (one) date has been selected.", "Form Error");
            return;

        }

        this.questionnaireService.export(this.options)
            .subscribe({ error: err => this.errorService.handleError(err, "Export File", "Downolad") });
    }

}

