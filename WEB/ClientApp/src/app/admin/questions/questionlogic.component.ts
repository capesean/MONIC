import { Component, Input } from '@angular/core';
import { NgForm } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Enum, Enums, QuestionTypes } from '../../common/models/enums.model';
import { Question } from '../../common/models/question.model';
import { Questionnaire } from '../../common/models/questionnaire.model';
import { QuestionOption, QuestionOptionSearchOptions } from '../../common/models/questionoption.model';
import { Section } from '../../common/models/section.model';
import { Logic } from '../../common/models/survey.model';
import { ErrorService } from '../../common/services/error.service';
import { QuestionService } from '../../common/services/question.service';
import { QuestionOptionService } from '../../common/services/questionoption.service';

@Component({
    selector: 'app-questionlogic',
    templateUrl: './questionlogic.component.html'
})
export class QuestionLogicModalComponent {

    public logic: Logic;
    public question: Question;
    public questionnaire: Questionnaire;
    public section: Section;
    public selectedOptions = new Map<string, boolean>();
    public skipLogicActions: Enum[] = Enums.SkipLogicActions;
    public questionType_optionList = Enums.QuestionTypes[QuestionTypes.OptionList];
    public availableOptions: QuestionOption[] = [];

    setData(question: Question, logic: Logic) {
        this.question = question;
        if (!logic) this.logic = new Logic();
        else this.logic = logic;

        if (this.logic.checkQuestionId && this.logic.checkQuestion)
            this.changeQuestion(logic.checkQuestion);
    }

    constructor(
        public modal: NgbActiveModal,
        public questionService: QuestionService,
        private toastr: ToastrService,
        private errorService: ErrorService,
        private questionOptionService: QuestionOptionService
    ) { }

    public saveLogic(form: NgForm): void {

        if (form.invalid) {

            this.toastr.error("The form has not been completed correctly.", "Form Error");
            return;

        }

        if (this.question.questionId === this.logic.checkQuestionId) {

            this.toastr.error("You cannot reference the same question in the question logic.");
            return;

        }

        this.logic.checkOptions = this.availableOptions
            .filter(o => this.selectedOptions.get(o.questionOptionId));


        if (this.logic.checkOptions.length === 0) {

            this.toastr.error("You need to select at least one Question Option.");
            return;

        }

        this.modal.close(this.logic);
    }

    public clear(): void {
        this.modal.close(new Logic());
    }

    public questionOptionsChanged(questionOptions: QuestionOption[]): void {
        questionOptions.forEach(qo => {
            if (!this.logic.checkOptions.find(o => o.questionOptionId === qo.questionOptionId))
                this.logic.checkOptions.push(qo);
        });
    }

    public changeQuestion(question?: Question): void {

        // load all the question options for the selected question, so the user can choose
        // and set the selected options if it's loading an existing logic

        if (!question || !question.questionOptionGroupId) {
            this.logic.checkOptions = [];
        }
        else {
            this.questionOptionService.search({ questionOptionGroupId: question.questionOptionGroupId, pageSize: 0 } as QuestionOptionSearchOptions)
                .subscribe({
                    next: response => {
                        this.availableOptions = response.questionOptions;
                        response.questionOptions.forEach(option => {
                            this.selectedOptions.set(option.questionOptionId, !!this.logic.checkOptions.find(o => o.questionOptionId === option.questionOptionId));
                        });
                    },
                    error: err => this.errorService.handleError(err, "Question Options", "Load")
                });
        }
    }

    public questionOptionClick(questionOption: QuestionOption): void {
        this.selectedOptions.set(questionOption.questionOptionId, !this.selectedOptions.get(questionOption.questionOptionId));
    }

    public selectAll(): void {
        this.availableOptions.forEach(o => this.selectedOptions.set(o.questionOptionId, true));
    }
}
