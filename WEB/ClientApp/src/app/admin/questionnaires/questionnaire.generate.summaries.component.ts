import { Component as NgComponent, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GenerateSummariesModel, QuestionnaireService } from '../../common/services/questionnaire.service';
import { Questionnaire } from '../../common/models/questionnaire.model';
import { ErrorService } from '../../common/services/error.service';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';
import { QuestionModalComponent } from '../questions/question.modal.component';
import { Question } from '../../common/models/question.model';
import { Enum, Enums } from '../../common/models/enums.model';
import { ViewChild } from '@angular/core';
import { QuestionSummary } from '../../common/models/questionsummary.model';

enum QuestionStatus { Queued, Processing, Success, Error }

@NgComponent({
    selector: 'questionnaire-generate-summaries',
    templateUrl: './questionnaire.generate.summaries.component.html'
})
export class QuestionnaireGenerateSummariesComponent implements OnInit {

    @ViewChild('questionModal') questionModal: QuestionModalComponent;
    @ViewChild('formConfiguration') formConfiguration: NgForm;

    public questionnaire: Questionnaire;
    public questionSummaries: QuestionSummary[] = [];
    public questionIds: string[] = [];
    public questionTypes: Enum[] = Enums.QuestionTypes;
    public dateTypes: Enum[] = Enums.DateTypes;
    public questionStatuses: { [id: string]: QuestionStatus; } = {};
    public processing = false;
    public generateSummariesModel = new GenerateSummariesModel();

    constructor(
        public modal: NgbActiveModal,
        private questionnaireService: QuestionnaireService,
        private toastr: ToastrService,
        private errorService: ErrorService
    ) {
    }

    ngOnInit(): void {
        this.generateSummariesModel.questionnaire = this.questionnaire;
        this.generateSummariesModel.questionnaireId = this.questionnaire.questionnaireId;
        this.generateSummariesModel.maxTokens = 250;
        this.generateSummariesModel.temperature = 0.7;
        this.generateSummariesModel.systemMessage = `You are a helpful assistant that analyzes and summarizes responses to questions from a questionnaire that was distributed to ${this.questionnaire.entityType.plural.toLowerCase()}. Respond without any thanks.`;
        this.generateSummariesModel.textPrompt = "Please analyse/summarize the answers to the question: {questionText}\n";
        this.generateSummariesModel.textPrompt += "[{answers}]";
        this.generateSummariesModel.optionListPrompt = "Please analyse and summarize the answers to the question: {questionText}\n";
        this.generateSummariesModel.optionListPrompt += "{answerCount} {entityTypePlural} provided responses.\n"
        this.generateSummariesModel.optionListPrompt += "The available options and answer counts were:\n";
        this.generateSummariesModel.optionListPrompt += "[{optionsAndCounts}]";
    }

    submit(form: NgForm) {

        if (form.invalid) {

            this.toastr.error("The form has not been completed correctly.", "Form Error");
            return;

        }

        // the tab might not be displayed in which case the form will be undefined
        if (!this.generateSummariesModel.systemMessage
            || !this.generateSummariesModel.textPrompt
            || !this.generateSummariesModel.optionListPrompt
            || !this.generateSummariesModel.maxTokens
            || this.generateSummariesModel.temperature == null
            || this.generateSummariesModel.temperature < 0
            || this.generateSummariesModel.temperature > 1) {

            this.toastr.error("The configuration form has not been completed correctly.", "Form Error");
            return;

        }

        this.processing = true;
        this.processQuestion(true);

    }

    private processQuestion(firstRun = false): void {

        const questionIndex = this.questionSummaries.findIndex(o => this.questionStatuses[o.questionId] === QuestionStatus.Queued);

        if (questionIndex < 0) {

            if (firstRun) this.toastr.error("There are no questions to process.");
            this.processing = false;

        } else {

            const questionSummary = this.questionSummaries[questionIndex];
            this.generateSummariesModel.questionId = questionSummary.questionId;
            this.questionStatuses[questionSummary.questionId] = QuestionStatus.Processing;

            this.questionnaireService.generateSummary(this.generateSummariesModel)
                .subscribe({
                    next: qs => {
                        // generate controller action doesn't load the question object, so we need to add it here
                        qs.question = questionSummary.question;
                        this.questionSummaries[questionIndex] = qs;
                        this.questionStatuses[qs.questionId] = QuestionStatus.Success;
                        this.processQuestion();
                    },
                    error: err => {
                        this.questionStatuses[questionSummary.questionId] = QuestionStatus.Error;
                        this.errorService.handleError(err, "Summary", "Generate");
                        this.processQuestion();
                    }
                });

        }
    }

    openQuestionModal(): void {
        this.questionModal.open();
    }

    questionsSelected(questions: Question[]): void {
        for (let question of questions) {
            const index = this.questionIds.findIndex(o => o === question.questionId);
            if (index < 0) {
                this.questionIds.push(question.questionId);
                this.questionSummaries.push({ questionId: question.questionId, question: question, date: this.generateSummariesModel.date, dateId: this.generateSummariesModel.dateId } as QuestionSummary);
            }
            this.questionStatuses[question.questionId] = QuestionStatus.Queued;
        }
    }

    getStatusName(questionSummary: QuestionSummary): string {
        if (this.questionStatuses[questionSummary.questionId] === QuestionStatus.Queued) return "Queued";
        else if (this.questionStatuses[questionSummary.questionId] === QuestionStatus.Processing) return "Processing";
        else if (this.questionStatuses[questionSummary.questionId] === QuestionStatus.Success) return "Success";
        else if (this.questionStatuses[questionSummary.questionId] === QuestionStatus.Error) return "Error";
        else throw "Invalid status";
    }

    getStatus(questionSummary: QuestionSummary): QuestionStatus {
        return this.questionStatuses[questionSummary.questionId];
    }

    reset(): void {
        this.questionSummaries.forEach(qs => this.questionStatuses[qs.questionId] = QuestionStatus.Queued);
    }

    hasNonQueued(): boolean {
        return !!this.questionSummaries.find(qs => this.questionStatuses[qs.questionId] !== QuestionStatus.Queued);
    }
}

