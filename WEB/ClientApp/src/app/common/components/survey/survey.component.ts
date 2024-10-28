import { Component, Input, OnInit, Output } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ErrorService } from '../../../common/services/error.service';
import { Response } from '../../../common/models/response.model';
import { HttpErrorResponse } from '@angular/common/http';
import { Question } from '../../../common/models/question.model';
import { OptionListTypes, QuestionTypes, SkipLogicActions } from '../../../common/models/enums.model';
import { SurveyService } from '../../../common/services/survey.service';
import { AnswerOption } from '../../../common/models/answeroption.model';
import { catchError, map, of } from 'rxjs';
import { Observable } from 'rxjs';
import { ViewChild } from '@angular/core';
import { HostListener } from '@angular/core';
import { Document } from '../../../common/models/document.model';
import { AnswerItem, LocalSection, Logic, QuestionLink, SurveyParams } from '../../../common/models/survey.model';
import { tap } from 'rxjs';
import { throwError } from 'rxjs';
import { QuestionOption } from '../../../common/models/questionoption.model';
import { AuthService } from '../../services/auth.service';
import { ConfirmModalComponent, ConfirmModalOptions } from '../confirm.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EventEmitter } from '@angular/core';
import { Questionnaire } from '../../models/questionnaire.model';

@Component({
    selector: 'app-survey',
    templateUrl: './survey.component.html',
    styleUrls: ['./survey.component.css']
})
export class SurveyComponent {

    private surveyParams = new SurveyParams();
    public isLoggedIn = false;

    @Input() set responseId(_responseId: string) {
        this.surveyParams.responseId = _responseId;
        this.loadResponse();
    }

    @Input() set publicCode(_publicCode: string) {
        this.surveyParams.publicCode = _publicCode;
        this.loadResponse();
    }

    @Output() questionnaire: EventEmitter<Questionnaire> = new EventEmitter<Questionnaire>();

    private _form: NgForm;
    @ViewChild('form') set form(form: NgForm) {
        if (form) this._form = form;
    }

    public response = new Response();
    public isNew = false;
    public endOfQuestionnaire = false;

    public sections: LocalSection[];
    public questionTypes = QuestionTypes;
    public optionListTypes = OptionListTypes;
    public sectionAccessibility = new Map<string, boolean>();

    public current: QuestionLink;
    private questionLinks: QuestionLink[] = [];
    private questionLookup: Map<string, Question> = new Map<string, Question>();
    private skipLogicOptionsLookup: Map<string, string[]> = new Map<string, string[]>();

    public optionMap: any = {};
    private answerCache = new Map<string, AnswerItem>();

    constructor(
        private router: Router,
        private errorService: ErrorService,
        private surveyService: SurveyService,
        private toastr: ToastrService,
        private route: ActivatedRoute,
        private authService: AuthService,
        private modalService: NgbModal
    ) {
    }

    public loadResponse(): void {

        this.surveyService.getResponse(this.surveyParams)
            .subscribe({
                next: response => {
                    this.response = response;
                    this.surveyParams.responseId = response.responseId;
                    this.loadStructure();
                    this.questionnaire.emit(response.questionnaire);
                },
                error: err => {
                    this.errorService.handleError(err, "Questionnaire Response", "Load");
                }
            });

        this.authService.loggedIn$.subscribe(loggedIn => this.isLoggedIn = loggedIn);

    }

    private loadStructure(): void {

        this.surveyService.loadStructure(this.surveyParams)
            .subscribe({
                next: structure => {

                    if (!structure.sections.length) {
                        this.toastr.error(`The questionnaire does not have any sections`);
                        this.router.navigate(["/questionnaire"]);
                    }

                    let previousQuestionLink: QuestionLink = undefined;

                    this.sections = structure.sections as LocalSection[];
                    this.questionLinks = [];

                    this.sections.forEach(section => {

                        section.questions = structure.questions.filter(o => o.sectionId === section.sectionId);

                        if (!section.questions.length) {
                            this.toastr.error(`Section <strong>${section.name}</strong> has no questions`, undefined, { enableHtml: true });
                            return;
                        }

                        section.questions.forEach(question => {

                            question.section = section;
                            this.questionLookup.set(question.questionId, question);

                            // build the question chain
                            let questionLink = new QuestionLink();
                            questionLink.previous = previousQuestionLink;
                            questionLink.question = question;
                            if (previousQuestionLink) previousQuestionLink.next = questionLink;
                            this.questionLinks.push(questionLink);

                            // set the options
                            if (question.questionType === QuestionTypes.OptionList) {
                                question.questionOptionGroup = structure.questionOptionGroups.find(o => o.questionOptionGroupId === question.questionOptionGroupId);
                                if (!question.questionOptionGroup) {
                                    this.toastr.error(`The question <strong>${question.code}</strong> has not been configured with a question option group.`, undefined, { enableHtml: true });
                                    this.router.navigate(["/questionnaire"]);
                                }
                                if (!question.questionOptionGroup.questionOptions.length) {
                                    this.toastr.error(`The question <strong>${question.code}</strong> has not been configured with any options.`, undefined, { enableHtml: true });
                                    this.router.navigate(["/questionnaire"]);
                                }
                            }

                            previousQuestionLink = questionLink;

                        });

                    });

                    this.questionLinks[0].isFirst = true;
                    this.questionLinks[this.questionLinks.length - 1].isLast = true;

                    this.skipLogicOptionsLookup = new Map<string, string[]>();
                    structure.skipLogicOptions.forEach(skipLogicOption => {
                        if (!this.skipLogicOptionsLookup.has(skipLogicOption.questionId))
                            this.skipLogicOptionsLookup.set(skipLogicOption.questionId, []);
                        this.skipLogicOptionsLookup.get(skipLogicOption.questionId).push(skipLogicOption.checkQuestionOptionId);
                    });

                    this.route.queryParams.subscribe(params => {

                        if (params.code) {
                            this.goToQuestion(params.code, true);
                            //this.nextQuestion(this.questionLinks.find(o => o.isLast));
                        }
                        else
                            this.setQuestion(this.questionLinks[0], true);

                    });

                    this.setSectionAccessibility();
                },
                error: err => this.errorService.handleError(err, "Questionnaire Data", "Load")
            });
    }

    @HostListener('document:keydown', ['$event'])
    keydown(event: KeyboardEvent) {
        if (event.target && (event.target as any).tagName?.toUpperCase() === "TEXTAREA") return;
        if (event.target && (event.target as any).tagName?.toUpperCase() === "INPUT" && (event.target as any).type?.toUpperCase() === "TEXT") return;
        if (event.code === "ArrowRight") {
            this.moveNext();
        }
        else if (event.code === "ArrowLeft") {
            if (this.endOfQuestionnaire) this.setQuestion(this.questionLinks[this.questionLinks.length - 1], false);
            else this.movePrevious(this.current);
        }
    }

    public movePrevious(questionLink: QuestionLink): void {
        if (questionLink.isFirst) return;

        this.saveAnswer(false)
            .subscribe(result => {
                if (result) this.setQuestion(questionLink.previous, false);
            });
    }

    public moveNext(): void {
        if (this.endOfQuestionnaire) return;

        this.saveAnswer(true)
            .subscribe(result => {
                if (result) this.nextQuestion(this.current);
            });
    }

    private nextQuestion(questionLink: QuestionLink): void {
        if (questionLink.isLast) {
            this.current = undefined;
            this.endOfQuestionnaire = true;
        }
        else {
            this.setQuestion(questionLink.next, true);
        }
    }

    private goToQuestion(code: string, forward: boolean): void {
        const questionLink = this.questionLinks.find(o => o.question.code === code);
        if (!questionLink) this.toastr.error("Can't find question: " + code);
        else this.setQuestion(questionLink, forward);
    }

    private shouldShowQuestion(question: Question): Observable<boolean> {

        //console.log(`shouldShowQuestion ${question.questionId} (${question.code}): dependant question: ${question.checkQuestionId}. Cache: ${this.answerCache.size}`);

        // no skip logic
        //if (!logic) return of(true);
        if (!question.checkQuestionId) return of(true);

        if (!this.skipLogicOptionsLookup.has(question.questionId)) {
            this.toastr.error(`Question ${question.code} does not have any skip logic options configured`);
            throw `Question ${question.code} does not have any skip logic options configured`;
        }

        return this.getAnswer(question.checkQuestionId)
            .pipe(
                map(
                    answer => {

                        const checkQuestion = this.questionLookup.get(question.checkQuestionId);
                        const skipLogicOptionIds = this.skipLogicOptionsLookup.get(question.questionId);

                        if (checkQuestion.questionType !== QuestionTypes.OptionList) {
                            this.errorService.throw("Validation for this question type has not been implemented");
                        }

                        const optionCount = skipLogicOptionIds.filter(skipLogicOptionId => !!answer.answerOptions.find(ao => ao.questionOptionId === skipLogicOptionId)).length;

                        // OR: optionCount === 0
                        // AND: optionCount === optionIds.length

                        return question.skipLogicAction === SkipLogicActions.Hide ? optionCount === 0 : optionCount !== 0;

                    }
                ),
                catchError(
                    err => {
                        this.errorService.handleError(err, "Answer", "Retrieve");
                        throw err;
                    })
            );
    }

    // after checking if this question CAN be set, this sets the question
    private setQuestion(questionLink: QuestionLink, forward: boolean): void {

        // skip logic
        this.shouldShowQuestion(questionLink.question)
            .subscribe(
                show => {

                    if (!show) {
                        if (forward) this.nextQuestion(questionLink);
                        else this.movePrevious(questionLink);
                        return;
                    }

                    this.current = questionLink;
                    this.endOfQuestionnaire = false;
                    this.optionMap = {};

                    this.getAnswer(questionLink.question.questionId)
                        .subscribe({
                            next: answer => {

                                // showing a question: clear the cache completely
                                this.answerCache.clear();
                                //console.log("cache cleared");

                                // no answer in the database, create a new one
                                // api now sends an empty (new) answer back
                                if (answer === undefined) {
                                    let answer = new AnswerItem();
                                    answer.questionId = questionLink.question.questionId;
                                    answer.responseId = this.response.responseId;
                                }
                                // api can't set the documents as it's not a c# property
                                if (answer.documents == null) answer.documents = [];

                                if (this.current.question.questionType === QuestionTypes.OptionList) {

                                    // todo: validate that selectedoptions are one of  available options? if not, clear value?

                                    if (this.current.question.optionListType === OptionListTypes.Dropdown
                                        || this.current.question.optionListType === OptionListTypes.RadioList
                                        || this.current.question.optionListType === OptionListTypes.Rating) {

                                        // ratings can only have 1 answer/option
                                        if (answer.answerOptions.length > 1) this.errorService.throw("More than one selected rating was loaded");
                                        else if (answer.answerOptions.length) answer.value = answer.answerOptions[0].questionOptionId;

                                    } else if (this.current.question.optionListType === OptionListTypes.Checkboxes) {

                                        this.current.question.questionOptionGroup.questionOptions.forEach(option => {
                                            this.optionMap[option.questionOptionId] = !!answer.answerOptions.find(o => o.questionOptionId === option.questionOptionId);
                                        });
                                        this.setOptionMapToAnswerValue(answer);

                                    } else {
                                        throw "Unhandled OptionListType in getAnswer()";
                                    }

                                }
                                else if (this.current.question.questionType === QuestionTypes.Text
                                    || this.current.question.questionType === QuestionTypes.Multiline
                                    || this.current.question.questionType === QuestionTypes.Document
                                    || this.current.question.questionType === QuestionTypes.Note
                                ) {
                                    // nothing needed
                                } else {
                                    throw "Unhandled Question Type in submitQuestionForm: " + this.current.question.questionType;
                                }

                                // reset form before setting answer so resetting doesn't clear answers
                                if (this._form) this._form.resetForm();

                                // set the answer against this question
                                // timeout used otherwise answers show as blank
                                setTimeout(() => {

                                    this.current.answer = answer;

                                    if (this.current.question.questionType === QuestionTypes.Document) {
                                        this.checkDocuments();
                                    }

                                    // checkdocuments might add a file control: mark as pristine after delay
                                    setTimeout(() => {
                                        this._form.form.markAsUntouched();
                                        this._form.form.markAsPristine();
                                    }, 0);

                                }, 0);

                            },
                            error: err => this.errorService.handleError(err, "Answer", "Load")
                        });
                }
            )

    }

    private getAnswer(questionId: string): Observable<AnswerItem> {

        if (this.answerCache.has(questionId)) {
            //console.log("using cache for " + questionId);
            return of(this.answerCache.get(questionId));
        }

        return this.surveyService.getAnswer(this.surveyParams, questionId)
            .pipe(
                tap(
                    answer => {
                        this.answerCache.set(questionId, answer);
                        //console.log("cacheing " + questionId + ". new cache size: " + this.answerCache.size);
                    }
                ),
                catchError(
                    err => {
                        if (err instanceof HttpErrorResponse && err.status === 404) return of(undefined as AnswerItem);
                        throw (err);
                    }
                )
            );
    }

    private setSectionAccessibility(): void {

        // todo: currently disabled the sections accessibility - need to click through one section at a time

        //let previousSectionCompleted = true;
        this.sections.forEach((section, index) => {
            // always allow first section access
            if (index === 0)
                section.canAccess = true;
            else
                section.canAccess = section.canNavigate;
            //    let allQuestionsAreComplete = true;
            //    section.questions.forEach(question => {
            //        if (true) {
            //        }
            //    });
            //    previousSectionCompleted = allQuestionsAreComplete
        });
    }

    public setSection(section: LocalSection): void {
        if (!section.canAccess) return;

        if (this.endOfQuestionnaire) {
            this.setQuestion(this.questionLinks.find(o => o.question.sectionId === section.sectionId), true);
        } else {
            this.saveAnswer(false).subscribe(
                result => {
                    if (result) this.setQuestion(this.questionLinks.find(o => o.question.sectionId === section.sectionId), true);
                }
            );
        }
    }

    public submit(): void {
        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Submit Questionnaire", text: "Are you sure you want to submit this questionnaire? You will not be able to make any further changes if you do.", deleteStyle: false, ok: "Submit" } as ConfirmModalOptions;
        modalRef.result.then(
            () => {

                this.surveyService.submit(this.response.responseId)
                    .subscribe({
                        next: response => {
                            this.toastr.success("The questionnaire has been submitted");
                            this.response = response;
                        },
                        error: err => this.errorService.handleError(err, "Questionnaire", "Submit")

                    });

            },
            () => { });
    }

    private validateForm(): boolean {
        // todo: if document question type has minimum / maximum required number of files, then this needs to be fixed...
        if (this.current.question.questionType === QuestionTypes.Document) {
            if (this.current.question.required && this.current.answer.documents.filter(o => o.documentId !== "00000000-0000-0000-0000-000000000000" || !!o.fileContents).length < this.current.question.minimumDocuments) {
                return false;
            }
        } else if (this._form.invalid) {
            return false;
        }
        return true;
    }

    private saveAnswer(forwards: boolean): Observable<boolean> {

        const answer = this.current.answer;

        // form has been touched OR moving forwards: trigger validate
        // (trigger on pristine moving forwards in case no answer yet)
        if ((!this._form.pristine || forwards) && !this.validateForm()) {

            // trigger the submit in case of moving back or section change
            this._form.onSubmit(undefined);
            this._form.form.markAllAsTouched();
            this._form.form.markAsTouched();
            this._form.ngSubmit.emit();

            this.toastr.error("The form has not been completed correctly.");
            return of(false);
        }

        // if the answer has not been modified, no need to save: return true as if saved
        if (this._form.pristine) {
            return of(true);
        }

        if (answer.questionId !== this.current.question.questionId) {
            throw "Question Id on answer does not match questionId on current QuestionLink";
        }

        // rating (option) questions require moving the answer into an option before saving
        if (this.current.question.questionType === QuestionTypes.OptionList) {
            if (this.current.question.optionListType === OptionListTypes.Checkboxes) {

                answer.answerOptions = [];

                // multiple select: the optionIds should come from the optionMap
                this.current.question.questionOptionGroup.questionOptions.forEach(option => {
                    if (this.optionMap[option.questionOptionId] === true) {
                        let answerOption = new AnswerOption();
                        answerOption.answerId = answer.answerId;
                        answerOption.questionOptionId = option.questionOptionId;
                        answer.answerOptions.push(answerOption);
                    }
                })

            } else if (this.current.question.optionListType === OptionListTypes.Rating
                || this.current.question.optionListType === OptionListTypes.Dropdown
                || this.current.question.optionListType === OptionListTypes.RadioList) {

                // single select: the optionId will be in the answer value field/property
                if (answer.value) {
                    let answerOption = new AnswerOption();
                    answerOption.answerId = answer.answerId;
                    answerOption.questionOptionId = answer.value;
                    answer.answerOptions = [answerOption];
                }
            } else {
                throw "Not implemented!";
            }
        }
        else if (this.current.question.questionType === QuestionTypes.Document) {
            this.current.answer.documents = this.current.answer.documents.filter(o => o.documentId !== '00000000-0000-0000-0000-000000000000' || !!o.fileContents);
        }
        else if (this.current.question.questionType === QuestionTypes.Text
            || this.current.question.questionType === QuestionTypes.Multiline) {
            // nothing needed
        } else {
            throw "Unhandled Question Type in submitQuestionForm";
        }

        // save and then move to next question
        return this.surveyService.saveAnswer(this.surveyParams, answer)
            .pipe(tap(progress => {
                this.response.totalQuestions = progress.totalQuestions;
                this.response.applicableQuestions = progress.applicableQuestions;
                this.response.completedQuestions = progress.completedQuestions;
                this.toastr.success("Your answer has been saved");
                // done here so that if moving backwards where previous question is skipped, doesn't re-save the current question
                this._form.form.markAsPristine();
                this._form.form.markAsUntouched();
            }))
            .pipe(map(() => true)) // return true: save was successful
            .pipe(catchError(err => {
                if (err.error === "ANSWEREXISTS") {
                    this.toastr.error("Unable to save your answer as another answer has already been saved. The previously saved answer has been loaded.");
                    this.setQuestion(this.current, false);
                }
                else
                    this.errorService.handleError(err, "Answer", "Save");
                return throwError(() => err);
            }));

    }

    public download(documentId: string): void {
        this.surveyService.download(this.surveyParams, documentId).subscribe();
    }

    public clearDocument(index: number) {
        this.current.answer.documents.splice(index, 1);
        this.checkDocuments();
    }

    public checkDocuments(): void {
        // adds a new (empty) document if it's necessary
        if (this.response.submitted) return;
        if (this.current.answer.documents.find(o => o.documentId === "00000000-0000-0000-0000-000000000000" && !o.fileContents)) return;
        if (this.current.answer.documents.length >= this.current.question.maximumDocuments) return;
        const document = new Document();
        document.itemId = this.current.answer.answerId;
        this.current.answer.documents.push(document);
    }

    public checkboxChanged($event: boolean, option: QuestionOption) {
        if ($event == null) return;
        this.optionMap[option.questionOptionId] = $event;
        this.setOptionMapToAnswerValue(this.current.answer);
    }

    private setOptionMapToAnswerValue(answer: AnswerItem): void {
        answer.value = "";
        Object.keys(this.optionMap).forEach(questionOptionId => {
            if (this.optionMap[questionOptionId]) answer.value += (answer.value ? "," : "") + questionOptionId;
        })
    }

    public goToSubmit(): void {
        this.current = undefined;
        this.endOfQuestionnaire = true;
    }

}
