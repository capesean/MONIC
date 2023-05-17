import { Component as NgComponent, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmModalComponent, ModalOptions } from '../../common/components/confirm.component';
import { PagingHeaders } from '../../common/models/http.model';
import { Section } from '../../common/models/section.model';
import { Enum, Enums } from '../../common/models/enums.model';
import { BreadcrumbService } from '../../common/services/breadcrumb.service';
import { ErrorService } from '../../common/services/error.service';
import { SectionService } from '../../common/services/section.service';
import { Question, QuestionSearchOptions, QuestionSearchResponse } from '../../common/models/question.model';
import { QuestionService } from '../../common/services/question.service';
import { QuestionSortComponent } from '../questions/question.sort.component';

@NgComponent({
    selector: 'section-edit',
    templateUrl: './section.edit.component.html'
})
export class SectionEditComponent implements OnInit, OnDestroy {

    public section: Section = new Section();
    public isNew = true;
    private routerSubscription: Subscription;
    public questionTypes: Enum[] = Enums.QuestionTypes;

    public questionsSearchOptions = new QuestionSearchOptions();
    public questionsHeaders = new PagingHeaders();
    public questions: Question[] = [];
    public showQuestionsSearch = false;

    constructor(
        private router: Router,
        public route: ActivatedRoute,
        private toastr: ToastrService,
        private breadcrumbService: BreadcrumbService,
        private modalService: NgbModal,
        private sectionService: SectionService,
        private questionService: QuestionService,
        private errorService: ErrorService
    ) {
    }

    ngOnInit(): void {

        this.route.params.subscribe(params => {

            const sectionId = params["sectionId"];
            this.section.questionnaireId = this.route.snapshot.parent.params.questionnaireId;
            this.isNew = sectionId === "add";

            if (!this.isNew) {

                this.section.sectionId = sectionId;
                this.loadSection();

                this.questionsSearchOptions.sectionId = sectionId;
                this.questionsSearchOptions.includeParents = true;
                this.searchQuestions();

            }

            this.routerSubscription = this.router.events.subscribe(event => {
                if (event instanceof NavigationEnd && !this.route.firstChild) {
                    // this will double-load on new save, as params change (above) + nav ends
                    this.searchQuestions();
                }
            });

        });

    }

    ngOnDestroy(): void {
        this.routerSubscription.unsubscribe();
    }

    private loadSection(): void {

        this.sectionService.get(this.section.sectionId)
            .subscribe({
                next: section => {
                    this.section = section;
                    this.changeBreadcrumb();
                },
                error: err => {
                    this.errorService.handleError(err, "Section", "Load");
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

        this.sectionService.save(this.section)
            .subscribe({
                next: section => {
                    this.toastr.success("The section has been saved", "Save Section");
                    if (this.isNew) {
                        this.ngOnDestroy();
                        this.router.navigate(["../", section.sectionId], { relativeTo: this.route });
                    }
                },
                error: err => {
                    this.errorService.handleError(err, "Section", "Save");
                }
            });

    }

    delete(): void {

        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Section", text: "Are you sure you want to delete this section?", deleteStyle: true, ok: "Delete" } as ModalOptions;
        modalRef.result.then(
            () => {

                this.sectionService.delete(this.section.sectionId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The section has been deleted", "Delete Section");
                            this.router.navigate(["../../"], { relativeTo: this.route });
                        },
                        error: err => {
                            this.errorService.handleError(err, "Section", "Delete");
                        }
                    });

            }, () => { });
    }

    changeBreadcrumb(): void {
        this.breadcrumbService.changeBreadcrumb(this.route.snapshot, this.section.name !== undefined ? this.section.name.substring(0, 25) : "(new section)");
    }

    searchQuestions(pageIndex = 0): Subject<QuestionSearchResponse> {

        this.questionsSearchOptions.pageIndex = pageIndex;

        const subject = new Subject<QuestionSearchResponse>()

        this.questionService.search(this.questionsSearchOptions)
            .subscribe({
                next: response => {
                    subject.next(response);
                    this.questions = response.questions;
                    this.questionsHeaders = response.headers;
                },
                error: err => {
                    this.errorService.handleError(err, "Questions", "Load");
                }
            });

        return subject;

    }

    goToQuestion(question: Question): void {
        this.router.navigate(["questions", question.questionId], { relativeTo: this.route });
    }

    deleteQuestion(question: Question, event: MouseEvent): void {
        event.stopPropagation();

        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Question", text: "Are you sure you want to delete this question?", deleteStyle: true, ok: "Delete" } as ModalOptions;
        modalRef.result.then(
            () => {

                this.questionService.delete(question.questionId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The question has been deleted", "Delete Question");
                            this.searchQuestions(this.questionsHeaders.pageIndex);
                        },
                        error: err => {
                            this.errorService.handleError(err, "Question", "Delete");
                        }
                    });

            }, () => { });
    }

    deleteQuestions(): void {
        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Questions", text: "Are you sure you want to delete all the questions?", deleteStyle: true, ok: "Delete" } as ModalOptions;
        modalRef.result.then(
            () => {

                this.sectionService.deleteQuestions(this.section.sectionId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The questions have been deleted", "Delete Questions");
                            this.searchQuestions();
                        },
                        error: err => {
                            this.errorService.handleError(err, "Questions", "Delete");
                        }
                    });
            }, () => { });

    }

    showQuestionSort(): void {
        let modalRef = this.modalService.open(QuestionSortComponent, { size: 'xl', centered: true, scrollable: false });
        (modalRef.componentInstance as QuestionSortComponent).sectionId = this.section.sectionId;
        modalRef.result.then(
            () => this.searchQuestions(this.questionsHeaders.pageIndex),
            () => { }
        );
    }

}
