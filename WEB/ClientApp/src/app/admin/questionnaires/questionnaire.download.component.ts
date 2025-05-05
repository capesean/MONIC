import { Component as NgComponent, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { QuestionnaireService } from '../../common/services/questionnaire.service';
import { Questionnaire } from '../../common/models/questionnaire.model';
import { ErrorService } from '../../common/services/error.service';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';
import { Enum, Enums } from '../../common/models/enums.model';

@NgComponent({
    selector: 'questionnaire-download',
    templateUrl: './questionnaire.download.component.html',
    standalone: false
})
export class QuestionnaireDownloadComponent implements OnInit {

    public questionnaire: Questionnaire;
    public options = { includeSkipLogic: true, includeSummaries: false, dateId: undefined as string };
    public dateTypes: Enum[] = Enums.DateTypes;

    constructor(
        public modal: NgbActiveModal,
        private questionnaireService: QuestionnaireService,
        private toastr: ToastrService,
        private errorService: ErrorService
    ) {
    }

    ngOnInit(): void {
    }

    submit(form: NgForm) {

        if (form.invalid) {

            this.toastr.error("The form has not been completed correctly.", "Form Error");
            return;

        }

        this.questionnaireService.download(this.questionnaire.questionnaireId, undefined, this.options.dateId, this.options.includeSkipLogic, this.options.includeSummaries)
            .subscribe({
                error: err => this.errorService.handleError(err, "PDF", "Download")
            });
    }

}

