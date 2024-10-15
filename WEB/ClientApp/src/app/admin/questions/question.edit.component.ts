import { Component as NgComponent, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';
import { Subject } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { NgbModal, NgbNav } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmModalComponent, ConfirmModalOptions } from '../../common/components/confirm.component';
import { PagingHeaders } from '../../common/models/http.model';
import { Question } from '../../common/models/question.model';
import { Enum, Enums, QuestionTypes, SkipLogicActions } from '../../common/models/enums.model';
import { FadeThenShrink } from '../../common/animations/fadethenshrink';
import { BreadcrumbService } from '../../common/services/breadcrumb.service';
import { ErrorService } from '../../common/services/error.service';
import { QuestionService } from '../../common/services/question.service';
import { Answer, AnswerSearchOptions, AnswerSearchResponse } from '../../common/models/answer.model';
import { AnswerService } from '../../common/services/answer.service';
import { QuestionLogicModalComponent } from './questionlogic.component';
import { QuestionOption, QuestionOptionSearchOptions } from '../../common/models/questionoption.model';
import { QuestionOptionService } from '../../common/services/questionoption.service';
import { QuestionOptionGroupService } from '../../common/services/questionoptiongroup.service';
import { QuestionOptionGroup } from '../../common/models/questionoptiongroup.model';
import { QuestionOptionSortComponent } from '../questionoptions/questionoption.sort.component';
import { Section } from '../../common/models/section.model';
import { SectionService } from '../../common/services/section.service';
import { Logic, SurveyParams } from '../../common/models/survey.model';
import { SkipLogicOption } from '../../common/models/skiplogicoption.model';
import { SurveyService } from '../../common/services/survey.service';

@NgComponent({
    selector: 'question-edit',
    templateUrl: './question.edit.component.html',
    animations: [FadeThenShrink]
})
export class QuestionEditComponent implements OnInit {

    public question: Question = new Question();
    public isNew = true;
    public questionTypes: Enum[] = Enums.QuestionTypes;
    public optionListTypes: Enum[] = Enums.OptionListTypes;
    public qTypes = QuestionTypes;

    public answersSearchOptions = new AnswerSearchOptions();
    public answersHeaders = new PagingHeaders();
    public answers: Answer[] = [];
    public showAnswersSearch = false;

    public showOptionsTab = false;
    public questionOptionsSearchOptions = new QuestionOptionSearchOptions();
    public questionOptionsHeaders = new PagingHeaders();
    public questionOptions: QuestionOption[] = [];
    public sharedQuestionOptionGroupId: string;
    public sharedQuestionOptionGroup: QuestionOptionGroup;
    public questionOption = new QuestionOption();
    public editingQuestionOption = false;
    private section: Section;

    private nav: NgbNav;
    public logic: Logic;
    public logicText = "loading...";

    @ViewChild('nav', { static: false }) set content(_nav: NgbNav) {
        if (_nav) this.nav = _nav;
    }

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private toastr: ToastrService,
        private breadcrumbService: BreadcrumbService,
        private modalService: NgbModal,
        private questionService: QuestionService,
        private answerService: AnswerService,
        private errorService: ErrorService,
        private questionOptionService: QuestionOptionService,
        private questionOptionGroupService: QuestionOptionGroupService,
        private sectionService: SectionService,
        private surveyService: SurveyService
    ) {
    }

    ngOnInit(): void {

        this.route.params.subscribe(params => {

            const questionId = params["questionId"];
            this.question.sectionId = this.route.snapshot.parent.params.sectionId;
            this.isNew = questionId === "add";

            if (!this.isNew) {

                this.question.questionId = questionId;
                this.loadQuestion();

                this.answersSearchOptions.questionId = questionId;
                this.answersSearchOptions.includeParents = true;
                this.searchAnswers();

            } else {
                this.loadLogic();
                this.sectionService.get(this.question.sectionId)
                    .subscribe({
                        next: o => this.section = o,
                        error: err => this.errorService.handleError(err, "Section", "Load")
                    });
            }
        });

    }

    private loadQuestion(): void {

        this.questionService.get(this.question.questionId)
            .subscribe({
                next: question => {
                    this.question = question;
                    this.section = question.section;
                    this.changeBreadcrumb();
                    if (question.questionOptionGroup?.shared) {
                        this.sharedQuestionOptionGroup = question.questionOptionGroup;
                        this.sharedQuestionOptionGroupId = question.questionOptionGroupId;
                    } else {
                        this.sharedQuestionOptionGroup = undefined;
                        this.sharedQuestionOptionGroupId = undefined;
                    }
                    this.searchQuestionOptions();
                    this.nav.select(this.showOptionsTab ? 0 : 1);
                    this.loadLogic();
                },
                error: err => {
                    this.errorService.handleError(err, "Question", "Load");
                    if (err instanceof HttpErrorResponse && err.status === 404)
                        this.router.navigate(["../../"], { relativeTo: this.route });
                }
            });

    }

    save(form: NgForm): void {

        if (form.invalid) {

            this.toastr.error("The form has not been completed correctly.", "Form Error");
            return;

        }

        if (this.question.questionType === QuestionTypes.Document) {

            if (this.question.required && this.question.minimumDocuments <= 0) {
                this.toastr.error("Set a valid minimum number of required documents if the question is marked as required.", "Form Error");
                return;
            }

            if (!this.question.required && this.question.minimumDocuments > 0) {
                this.toastr.error("A minimum number of required documents cannot be set if the question is not marked as required.", "Form Error");
                return;
            }

        }

        if (this.question.questionType === QuestionTypes.OptionList) {
            if (this.sharedQuestionOptionGroupId) this.question.questionOptionGroupId = this.sharedQuestionOptionGroupId;
            else this.question.questionOptionGroupId = this.question.questionId;
        }

        this.questionService.save(this.question)
            .subscribe({
                next: question => {
                    this.toastr.success("The question has been saved", "Save Question");
                    if (this.isNew) this.router.navigate(["../", question.questionId], { relativeTo: this.route });
                    else {
                        this.searchQuestionOptions();
                        this.loadLogic();
                    }
                },
                error: err => {
                    this.errorService.handleError(err, "Question", "Save");
                }
            });

    }

    delete(): void {

        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Question", text: "Are you sure you want to delete this question?", deleteStyle: true, ok: "Delete" } as ConfirmModalOptions;
        modalRef.result.then(
            () => {

                this.questionService.delete(this.question.questionId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The question has been deleted", "Delete Question");
                            this.router.navigate(["../../"], { relativeTo: this.route });
                        },
                        error: err => {
                            this.errorService.handleError(err, "Question", "Delete");
                        }
                    });

            }, () => { });
    }

    changeBreadcrumb(): void {
        this.breadcrumbService.changeBreadcrumb(this.route.snapshot, this.question.code !== undefined ? this.question.code.substring(0, 25) : "(new question)");
    }

    searchAnswers(pageIndex = 0): Subject<AnswerSearchResponse> {

        this.answersSearchOptions.pageIndex = pageIndex;

        const subject = new Subject<AnswerSearchResponse>()

        this.answerService.search(this.answersSearchOptions)
            .subscribe({
                next: response => {
                    subject.next(response);
                    this.answers = response.answers;
                    this.answersHeaders = response.headers;
                },
                error: err => {
                    this.errorService.handleError(err, "Answers", "Load");
                }
            });

        return subject;

    }

    goToAnswer(answer: Answer): void {
        this.router.navigate(["/questionnaires", answer.response.questionnaire.questionnaireId, "responses", answer.response.responseId, "answers", answer.answerId]);
    }

    deleteAnswer(answer: Answer, event: MouseEvent): void {
        event.stopPropagation();

        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Answer", text: "Are you sure you want to delete this answer?", deleteStyle: true, ok: "Delete" } as ConfirmModalOptions;
        modalRef.result.then(
            () => {

                this.answerService.delete(answer.answerId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The answer has been deleted", "Delete Answer");
                            this.searchAnswers(this.answersHeaders.pageIndex);
                        },
                        error: err => {
                            this.errorService.handleError(err, "Answer", "Delete");
                        }
                    });

            }, () => { });
    }

    deleteAnswers(): void {
        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Answers", text: "Are you sure you want to delete all the answers?", deleteStyle: true, ok: "Delete" } as ConfirmModalOptions;
        modalRef.result.then(
            () => {

                this.questionService.deleteAnswers(this.question.questionId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The answers have been deleted", "Delete Answers");
                            this.searchAnswers();
                        },
                        error: err => {
                            this.errorService.handleError(err, "Answers", "Delete");
                        }
                    });
            }, () => { });

    }

    editLogic($event: MouseEvent): void {
        $event.stopPropagation();
        let modalRef = this.modalService.open(QuestionLogicModalComponent, { centered: true, size: 'xl' });
        (modalRef.componentInstance as QuestionLogicModalComponent).questionnaire = this.section.questionnaire;
        (modalRef.componentInstance as QuestionLogicModalComponent).section = this.section;
        (modalRef.componentInstance as QuestionLogicModalComponent).setData(this.question, this.logic);
        modalRef.result.then(
            (logic: Logic) => {
                this.setLogic(logic);
            }, () => { });
    }

    searchQuestionOptions(pageIndex = 0): void {
        if (this.question.questionType !== QuestionTypes.OptionList) {
            this.showOptionsTab = false;
            this.questionOptions = [];
            this.nav.select(this.showOptionsTab ? 0 : 1);
            return;
        }

        this.showOptionsTab = true;
        this.nav.select(this.showOptionsTab ? 0 : 1);
        this.questionOptionsSearchOptions.pageIndex = pageIndex;
        if (this.question.questionOptionGroup?.shared)
            this.questionOptionsSearchOptions.questionOptionGroupId = this.question.questionOptionGroupId;
        else
            this.questionOptionsSearchOptions.questionOptionGroupId = this.question.questionId;

        this.questionOptionService.search(this.questionOptionsSearchOptions)
            .subscribe({
                next: response => {
                    this.questionOptions = response.questionOptions;
                    this.questionOptionsHeaders = response.headers;
                    this.questionOption = new QuestionOption();
                    this.questionOption.questionOptionGroupId = this.question.questionId;
                },
                error: err => {
                    this.errorService.handleError(err, "Options", "Load");
                }
            });

    }

    deleteQuestionOption(questionOption: QuestionOption, event: MouseEvent): void {
        event.stopPropagation();

        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Option", text: "Are you sure you want to delete this option?", deleteStyle: true, ok: "Delete" } as ConfirmModalOptions;
        modalRef.result.then(
            () => {

                this.questionOptionService.delete(questionOption.questionOptionId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The option has been deleted", "Delete Option");
                            this.searchQuestionOptions(this.questionOptionsHeaders.pageIndex);
                        },
                        error: err => {
                            this.errorService.handleError(err, "Option", "Delete");
                        }
                    });

            }, () => { });
    }

    deleteQuestionOptions(): void {
        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Options", text: "Are you sure you want to delete all the options?", deleteStyle: true, ok: "Delete" } as ConfirmModalOptions;
        modalRef.result.then(
            () => {

                this.questionOptionGroupService.deleteQuestionOptions(this.question.questionOptionGroup.questionOptionGroupId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The options have been deleted", "Delete Options");
                            this.searchQuestionOptions();
                        },
                        error: err => {
                            this.errorService.handleError(err, "Options", "Delete");
                        }
                    });
            }, () => { });

    }

    saveQuestionOption(form: NgForm): void {

        if (form.invalid) {

            this.toastr.error("The form has not been completed correctly.", "Form Error");
            return;

        }

        this.questionOptionService.save(this.questionOption)
            .subscribe({
                next: () => {
                    this.toastr.success("The option has been saved", "Save Option");
                    form.form.reset();
                    form.reset();
                    form.resetForm();
                    this.cancelEdit();
                    this.searchQuestionOptions();
                },
                error: err => {
                    this.errorService.handleError(err, "Option", "Save");
                }
            });

    }

    showQuestionOptionSort(): void {
        let modalRef = this.modalService.open(QuestionOptionSortComponent, { size: 'xl', centered: true, scrollable: false });
        (modalRef.componentInstance as QuestionOptionSortComponent).questionOptionGroupId = this.question.questionOptionGroupId;
        modalRef.result.then(
            () => this.searchQuestionOptions(this.questionOptionsHeaders.pageIndex),
            () => { }
        );
    }

    editQuestionOption(questionOption: QuestionOption): void {
        //form.form.reset();
        //form.reset();
        //form.resetForm();
        this.questionOption = new QuestionOption();
        this.questionOption.questionOptionGroupId = questionOption.questionOptionGroupId;
        this.questionOption.questionOptionId = questionOption.questionOptionId;
        this.questionOption.label = questionOption.label;
        this.questionOption.value = questionOption.value;
        this.questionOption.color = questionOption.color;
        this.questionOption.sortOrder = questionOption.sortOrder;
        this.editingQuestionOption = true;
    }

    cancelEdit(): void {
        this.editingQuestionOption = false;
        this.questionOption = new QuestionOption();
        this.questionOption.questionOptionGroupId = this.question.questionId;
    }

    private setLogic(logic: Logic): void {

        this.question.checkQuestionId = logic.checkQuestionId;
        this.question.skipLogicAction = logic.skipLogicAction;
        this.question.skipLogicOptions = logic.checkOptions
            .map(o => {
                return {
                    questionId: this.question.questionId,
                    checkQuestionOptionId: o.questionOptionId
                } as SkipLogicOption;
            })
        this.logic = logic;

        if (!this.logic || !this.logic.checkQuestionId || !this.logic.checkOptions || this.logic.checkOptions.length === 0) {
            this.logicText = "(no logic)";
            return;
        }

        let ifStatement = "";
        let isStatement = "<div>is</div>";
        let thenStatement = `<div>then</div><div class='ms-5'><strong>${(this.logic.skipLogicAction === SkipLogicActions.Hide ? "don't ask" : "ask")}</strong> this question.</div>`;
        let optionText = "";

        this.questionService.get(this.logic.checkQuestionId)
            .subscribe(
                question => {
                    ifStatement = `<div>If the answer to question:<div><div class='ms-5'><strong>${question.code}: ${question.text}</strong></div>`

                    this.questionOptionService.search({ questionOptionGroupId: question.questionOptionGroupId, pageSize: 0 } as QuestionOptionSearchOptions)
                        .subscribe(response => {

                            this.logic.checkOptions.forEach(option => {
                                var questionOption = response.questionOptions.find(qo => qo.questionOptionId === option.questionOptionId);
                                if (questionOption)
                                    optionText += `${(optionText ? "<br/>or " : "")}<strong>${questionOption.label}</strong>`;
                            });
                            isStatement += "<div class='ms-5'>" + optionText + "</div>";
                            this.logicText = ifStatement + isStatement + thenStatement
                        })
                }
        );
    }

    private loadLogic(): void {
        if (this.question.checkQuestionId) {
            this.logicText = "loading...";
            this.surveyService.getLogic({} as SurveyParams, this.question.questionId)
                .subscribe({
                    next: logic => {
                        this.setLogic(logic);
                    },
                    error: err => this.errorService.handleError(err, "Skip Logic", "Load")
                })
        } else {
            this.setLogic(new Logic());
        }
    }

}
