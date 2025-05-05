import { Component as NgComponent, OnInit, OnDestroy, TemplateRef } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';
import { catchError, forkJoin, Subject, Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmModalComponent, ConfirmModalOptions } from '../../common/components/confirm.component';
import { PagingHeaders } from '../../common/models/http.model';
import { Questionnaire } from '../../common/models/questionnaire.model';
import { Enum, Enums, QuestionTypes } from '../../common/models/enums.model';
import { FadeThenShrink } from '../../common/animations/fadethenshrink';
import { BreadcrumbService } from '../../common/services/breadcrumb.service';
import { ErrorService } from '../../common/services/error.service';
import { QuestionnaireService } from '../../common/services/questionnaire.service';
import { Response, ResponseSearchOptions, ResponseSearchResponse } from '../../common/models/response.model';
import { ResponseService } from '../../common/services/response.service';
import { Section, SectionSearchOptions, SectionSearchResponse } from '../../common/models/section.model';
import { SectionService } from '../../common/services/section.service';
import { SectionSortComponent } from '../sections/section.sort.component';
import { QuestionnaireExportComponent } from './questionnaire.export.component';
import { Clipboard } from '@angular/cdk/clipboard';
import { environment } from '../../../environments/environment';
import { QuestionnaireDownloadComponent } from './questionnaire.download.component';
import { QuestionnaireGenerateSummariesComponent } from './questionnaire.generate.summaries.component';
import { Question } from '../../common/models/question.model';
import { AppDate } from '../../common/models/date.model';
import { AnswerService } from '../../common/services/answer.service';
import { QuestionOptionService } from '../../common/services/questionoption.service';
import { AnswerSearchOptions, AnswerSearchResponse } from '../../common/models/answer.model';
import { QuestionOptionSearchOptions, QuestionOptionSearchResponse } from '../../common/models/questionoption.model';
import { EChartsOption } from 'echarts/types/dist/shared';
import { Observable } from 'rxjs';
import { of } from 'rxjs';
import { QuestionSummaryService } from '../../common/services/questionsummary.service';
import { QuestionSummary } from '../../common/models/questionsummary.model';
import { OptionValueSearchOptions, OptionValueSearchResponse } from '../../common/models/optionvalue.model';
import { OptionValueService } from '../../common/services/optionvalue.service';

class AnalysisResults {
    questionSummary: QuestionSummary;
    chartOptions: EChartsOption;
    showAnswers = false;
    answers: AnalysisAnswer[] = [];
    editing = false;
}
class AnalysisAnswer {
    entity: string;
    entityCode: string;
    value: string;
}

@NgComponent({
    selector: 'questionnaire-edit',
    templateUrl: './questionnaire.edit.component.html',
    animations: [FadeThenShrink],
    standalone: false
})
export class QuestionnaireEditComponent implements OnInit, OnDestroy {

    public questionnaire: Questionnaire = new Questionnaire();

    public isNew = true;
    private routerSubscription: Subscription;
    public dateTypes: Enum[] = Enums.DateTypes;

    public sectionsSearchOptions = new SectionSearchOptions();
    public sectionsHeaders = new PagingHeaders();
    public sections: Section[] = [];
    public showSectionsSearch = false;

    public responsesSearchOptions = new ResponseSearchOptions();
    public responsesHeaders = new PagingHeaders();
    public responses: Response[] = [];
    public showResponsesSearch = false;

    public analysisOptions = {
        questionId: undefined as string,
        question: undefined as Question,
        dateId: undefined as string,
        date: undefined as AppDate,
        optionId: undefined as string
    };
    public analysisResults = new AnalysisResults();

    public duplicate = { name: undefined as string };

    constructor(
        private router: Router,
        public route: ActivatedRoute,
        private toastr: ToastrService,
        private breadcrumbService: BreadcrumbService,
        private modalService: NgbModal,
        private questionnaireService: QuestionnaireService,
        private responseService: ResponseService,
        private sectionService: SectionService,
        private errorService: ErrorService,
        private clipboard: Clipboard,
        private answerService: AnswerService,
        private questionOptionService: QuestionOptionService,
        private questionSummaryService: QuestionSummaryService,
        private optionValueService: OptionValueService
    ) {
    }

    ngOnInit(): void {

        this.route.params.subscribe(params => {

            const questionnaireId = params["questionnaireId"];
            this.isNew = questionnaireId === "add";

            if (!this.isNew) {

                this.questionnaire.questionnaireId = questionnaireId;
                this.loadQuestionnaire();

                this.sectionsSearchOptions.questionnaireId = questionnaireId;
                this.sectionsSearchOptions.includeParents = true;
                this.searchSections();

                this.responsesSearchOptions.questionnaireId = questionnaireId;
                this.responsesSearchOptions.includeParents = true;
                this.searchResponses();

            }

            this.routerSubscription = this.router.events.subscribe(event => {
                if (event instanceof NavigationEnd && !this.route.firstChild) {
                    // this will double-load on new save, as params change (above) + nav ends
                    this.searchSections();
                    this.searchResponses();
                }
            });

        });

    }

    ngOnDestroy(): void {
        this.routerSubscription.unsubscribe();
    }

    private loadQuestionnaire(): void {

        this.questionnaireService.get(this.questionnaire.questionnaireId)
            .subscribe({
                next: questionnaire => {
                    this.questionnaire = questionnaire;
                    this.changeBreadcrumb();

                    //if (window.location.hostname == "localhost") {

                    //    this.questionService.search({ pageSize: 1, includeParents: true, questionnaireId: this.questionnaire.questionnaireId, questionType: QuestionTypes.OptionList } as QuestionSearchOptions)
                    //        .subscribe({
                    //            next: results => {
                    //                this.analysisOptions.dateId = "B378E4CE-B9AA-4C46-A2A8-0629D222A8C9";
                    //                this.analysisOptions.questionId = results.questions[0].questionId;
                    //                this.analysisOptions.question = results.questions[0];
                    //                this.loadAnalysis({ valid: true } as NgForm);
                    //            }
                    //        });

                    //}

                },
                error: err => {
                    this.errorService.handleError(err, "Questionnaire", "Load");
                    if (err instanceof HttpErrorResponse && err.status === 404)
                        this.router.navigate(["../"], { relativeTo: this.route });
                }
            });

    }

    save(form: NgForm): void {

        if (form.invalid) {

            this.toastr.error("The form has not been completed correctly.", "Form Error");
            return;

        }

        this.questionnaireService.save(this.questionnaire)
            .subscribe({
                next: questionnaire => {
                    this.toastr.success("The questionnaire has been saved", "Save Questionnaire");
                    if (this.isNew) {
                        this.ngOnDestroy();
                        this.router.navigate(["../", questionnaire.questionnaireId], { relativeTo: this.route });
                    }
                },
                error: err => {
                    this.errorService.handleError(err, "Questionnaire", "Save");
                }
            });

    }

    delete(): void {

        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Questionnaire", text: "Are you sure you want to delete this questionnaire?", deleteStyle: true, ok: "Delete" } as ConfirmModalOptions;
        modalRef.result.then(
            () => {

                this.questionnaireService.delete(this.questionnaire.questionnaireId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The questionnaire has been deleted", "Delete Questionnaire");
                            this.router.navigate(["../"], { relativeTo: this.route });
                        },
                        error: err => {
                            this.errorService.handleError(err, "Questionnaire", "Delete");
                        }
                    });

            }, () => { });
    }

    changeBreadcrumb(): void {
        this.breadcrumbService.changeBreadcrumb(this.route.snapshot, this.questionnaire.name !== undefined ? this.questionnaire.name.substring(0, 25) : "(new questionnaire)");
    }

    searchSections(pageIndex = 0): Subject<SectionSearchResponse> {

        this.sectionsSearchOptions.pageIndex = pageIndex;

        const subject = new Subject<SectionSearchResponse>()

        this.sectionService.search(this.sectionsSearchOptions)
            .subscribe({
                next: response => {
                    subject.next(response);
                    this.sections = response.sections;
                    this.sectionsHeaders = response.headers;
                },
                error: err => {
                    this.errorService.handleError(err, "Sections", "Load");
                }
            });

        return subject;

    }

    goToSection(section: Section): void {
        this.router.navigate(["sections", section.sectionId], { relativeTo: this.route });
    }

    deleteSection(section: Section, event: MouseEvent): void {
        event.stopPropagation();

        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Section", text: "Are you sure you want to delete this section?", deleteStyle: true, ok: "Delete" } as ConfirmModalOptions;
        modalRef.result.then(
            () => {

                this.sectionService.delete(section.sectionId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The section has been deleted", "Delete Section");
                            this.searchSections(this.sectionsHeaders.pageIndex);
                        },
                        error: err => {
                            this.errorService.handleError(err, "Section", "Delete");
                        }
                    });

            }, () => { });
    }

    deleteSections(): void {
        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Sections", text: "Are you sure you want to delete all the sections?", deleteStyle: true, ok: "Delete" } as ConfirmModalOptions;
        modalRef.result.then(
            () => {

                this.questionnaireService.deleteSections(this.questionnaire.questionnaireId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The sections have been deleted", "Delete Sections");
                            this.searchSections();
                        },
                        error: err => {
                            this.errorService.handleError(err, "Sections", "Delete");
                        }
                    });
            }, () => { });

    }

    searchResponses(pageIndex = 0): Subject<ResponseSearchResponse> {

        this.responsesSearchOptions.pageIndex = pageIndex;

        const subject = new Subject<ResponseSearchResponse>()

        this.responseService.search(this.responsesSearchOptions)
            .subscribe({
                next: response => {
                    subject.next(response);
                    this.responses = response.responses;
                    this.responsesHeaders = response.headers;
                },
                error: err => {
                    this.errorService.handleError(err, "Responses", "Load");
                }
            });

        return subject;

    }

    goToResponse(response: Response): void {
        this.router.navigate(["responses", response.responseId], { relativeTo: this.route });
    }

    deleteResponse(response: Response, event: MouseEvent): void {
        event.stopPropagation();

        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Response", text: "Are you sure you want to delete this response?", deleteStyle: true, ok: "Delete" } as ConfirmModalOptions;
        modalRef.result.then(
            () => {

                this.responseService.delete(response.responseId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The response has been deleted", "Delete Response");
                            this.searchResponses(this.responsesHeaders.pageIndex);
                        },
                        error: err => {
                            this.errorService.handleError(err, "Response", "Delete");
                        }
                    });

            }, () => { });
    }

    deleteResponses(): void {
        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Responses", text: "Are you sure you want to delete all the responses?", deleteStyle: true, ok: "Delete" } as ConfirmModalOptions;
        modalRef.result.then(
            () => {

                this.questionnaireService.deleteResponses(this.questionnaire.questionnaireId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The responses have been deleted", "Delete Responses");
                            this.searchResponses();
                        },
                        error: err => {
                            this.errorService.handleError(err, "Responses", "Delete");
                        }
                    });
            }, () => { });

    }

    showSectionSort(): void {
        let modalRef = this.modalService.open(SectionSortComponent, { size: 'xl', centered: true, scrollable: false });
        (modalRef.componentInstance as SectionSortComponent).questionnaireId = this.questionnaire.questionnaireId;
        modalRef.result.then(
            () => this.searchSections(this.sectionsHeaders.pageIndex),
            () => { }
        );
    }

    export(): void {
        let modalRef = this.modalService.open(QuestionnaireExportComponent, { size: 'xl', centered: true, scrollable: false });
        (modalRef.componentInstance as QuestionnaireExportComponent).questionnaire = this.questionnaire;
    }

    copyUrl(): void {
        if (!this.questionnaire.publicCode) {
            this.toastr.error("This questionnaire does not have a public code (URL).");
            return;
        }
        this.clipboard.copy(`${environment.baseUrl}public/questionnaire/${this.questionnaire.publicCode}`);
        this.toastr.success("The public access URL has been copied to the clipboard.");
    }

    download(): void {
        let modalRef = this.modalService.open(QuestionnaireDownloadComponent, { size: 'md', centered: true, scrollable: false });
        (modalRef.componentInstance as QuestionnaireDownloadComponent).questionnaire = this.questionnaire;
    }

    generateSummaries(): void {
        let modalRef = this.modalService.open(QuestionnaireGenerateSummariesComponent, { size: 'xl', centered: true, scrollable: false });
        (modalRef.componentInstance as QuestionnaireGenerateSummariesComponent).questionnaire = this.questionnaire;
    }

    loadAnalysis(form: NgForm): void {

        this.analysisResults = new AnalysisResults();

        if (form.invalid) {

            this.toastr.error("The form has not been completed correctly.", "Form Error");
            return;

        }

        var apiCalls = {
            questionSummary: this.questionSummaryService.get(this.analysisOptions.questionId, this.analysisOptions.dateId)
                .pipe(catchError(() => of({ question: this.analysisOptions.question, questionId: this.analysisOptions.questionId, date: this.analysisOptions.date, dateId: this.analysisOptions.dateId, summary: undefined } as QuestionSummary))
                ),
            answerSearchResults: this.answerService.search({ pageSize: 0, questionId: this.analysisOptions.questionId, includeChildren: true } as AnswerSearchOptions),
            responseSearchResults: this.responseService.search({ pageSize: 0, questionnaireId: this.questionnaire.questionnaireId, includeParents: true } as ResponseSearchOptions),
            questionOptionResults: of(undefined),
            optionValueSearchResults: of(undefined)
        } as {
            questionSummary: Observable<QuestionSummary>,
            answerSearchResults: Observable<AnswerSearchResponse>,
            questionOptionResults: Observable<QuestionOptionSearchResponse>,
            responseSearchResults: Observable<ResponseSearchResponse>,
            optionValueSearchResults: Observable<OptionValueSearchResponse>
        };

        if (this.analysisOptions.question.questionType === QuestionTypes.OptionList && this.analysisOptions.question.questionOptionGroupId)
            apiCalls.questionOptionResults = this.questionOptionService.search({ pageSize: 0, questionOptionGroupId: this.analysisOptions.question.questionOptionGroupId } as QuestionOptionSearchOptions);

        if (this.analysisOptions.optionId)
            apiCalls.optionValueSearchResults = this.optionValueService.search({ pageSize: 0, optionId: this.analysisOptions.optionId } as OptionValueSearchOptions);

        forkJoin(apiCalls).subscribe({
            next: data => {

                this.analysisResults = new AnalysisResults();
                this.analysisResults.questionSummary = data.questionSummary;

                if (this.analysisOptions.question.questionType === QuestionTypes.OptionList) {

                    const xCategories: string[] = [];
                    const values: number[] = [];

                    for (const questionOption of data.questionOptionResults.questionOptions) {
                        xCategories.push(questionOption.label);
                        let count = 0;

                        for (const answer of data.answerSearchResults.answers) {

                            for (const answerOption of answer.answerOptions) {

                                if (answerOption.questionOptionId === questionOption.questionOptionId) {

                                    const response = data.responseSearchResults.responses.find(o => o.responseId === answer.responseId);

                                    // skip if filtering by an option
                                    if (this.analysisOptions.optionId && !data.optionValueSearchResults.optionValues.find(o => o.itemId === response.entityId))
                                        continue;

                                    this.analysisResults.answers.push({ entity: response.entity.shortName, entityCode: response.entity.code, value: questionOption.label } as AnalysisAnswer);
                                    count++;

                                }
                            };
                        };
                        values.push(count);
                    };

                    this.analysisResults.chartOptions = {
                        grid: {
                            left: 40,
                            right: 10,
                            top: 10,
                            bottom: 100
                        },
                        xAxis: {
                            type: 'category',
                            data: xCategories,
                            axisLabel: {
                                fontSize: 8,
                                rotate: 90,

                            }
                        },
                        yAxis: {
                            type: 'value',
                            axisLabel: {
                                //formatter: formatter,
                                fontSize: 8
                            },
                        },
                        series: [{
                            name: `Question ${this.analysisOptions.question.code}`,
                            type: "bar",
                            data: values,
                            colorBy: "data"
                        }],
                        tooltip: {
                            triggerOn: "click",
                            alwaysShowContent: false,
                            textStyle: {
                                fontSize: 10
                            },
                            //valueFormatter: formatter
                        }
                    } as EChartsOption;

                } else if (this.analysisOptions.question.questionType === QuestionTypes.Text || this.analysisOptions.question.questionType === QuestionTypes.Multiline) {

                    for (const answer of data.answerSearchResults.answers) {

                        const response = data.responseSearchResults.responses.find(o => o.responseId === answer.responseId);

                        // skip if filtering by an option
                        if (this.analysisOptions.optionId && !data.optionValueSearchResults.optionValues.find(o => o.itemId === response.entityId))
                            continue;

                        this.analysisResults.answers.push({ entity: response.entity.shortName, entityCode: response.entity.code, value: answer.value } as AnalysisAnswer);
                    }
                }
            },
            error: err => this.errorService.handleError(err, "Data", "Load")
        });

    }

    saveSummary(): void {
        this.questionSummaryService.save(this.analysisResults.questionSummary)
            .subscribe({
                next: () => {
                    this.toastr.success("The summary has been saved.", "Save Summary");
                    this.analysisResults.editing = false;
                },
                error: err => this.errorService.handleError(err, "Summary", "Save")
            });
    }

    openDuplicateModal(modal: TemplateRef<any>) {
        this.modalService.open(modal, { centered: true });

    }

    createDuplicate(form: NgForm) {

        if (form.invalid) {

            this.toastr.error("The form has not been completed correctly.", "Form Error");
            return;

        }

        this.questionnaireService.duplicate(this.questionnaire.questionnaireId, this.duplicate.name)
            .subscribe({
                next: questionnaire => {
                    this.toastr.success("The questionnaire has been duplicated", "Duplicate Questionnaire");
                    this.router.navigate(["../", questionnaire.questionnaireId], { relativeTo: this.route });
                    this.modalService.dismissAll();
                    window.scrollTo(0, 0);
                },
                error: err => this.errorService.handleError(err, "Questionnaire", "Duplicate")
            });

    }

}
