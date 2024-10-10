import { Component as NgComponent, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';
import { Subject } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmModalComponent, ConfirmModalOptions } from '../../common/components/confirm.component';
import { PagingHeaders } from '../../common/models/http.model';
import { Date } from '../../common/models/date.model';
import { Enum, Enums, DateTypes } from '../../common/models/enums.model';
import { BreadcrumbService } from '../../common/services/breadcrumb.service';
import { ErrorService } from '../../common/services/error.service';
import { DateService } from '../../common/services/date.service';
import { DateSearchOptions, DateSearchResponse } from '../../common/models/date.model';
import { Response, ResponseSearchOptions, ResponseSearchResponse } from '../../common/models/response.model';
import { ResponseService } from '../../common/services/response.service';

@NgComponent({
    selector: 'date-edit',
    templateUrl: './date.edit.component.html'
})
export class DateEditComponent implements OnInit {

    public date: Date = new Date();
    public isNew = true;
    public dateTypes: Enum[] = Enums.DateTypes;
    public dateTypeYear = Enums.DateTypes[DateTypes.Year];
    public dateTypeQuarter = Enums.DateTypes[DateTypes.Quarter];

    public datesInQuarterSearchOptions = new DateSearchOptions();
    public datesInQuarterHeaders = new PagingHeaders();
    public datesInQuarter: Date[] = [];
    public showDatesInQuarterSearch = false;

    public datesInYearSearchOptions = new DateSearchOptions();
    public datesInYearHeaders = new PagingHeaders();
    public datesInYear: Date[] = [];
    public showDatesInYearSearch = false;

    public responsesSearchOptions = new ResponseSearchOptions();
    public responsesHeaders = new PagingHeaders();
    public responses: Response[] = [];
    public showResponsesSearch = false;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private toastr: ToastrService,
        private breadcrumbService: BreadcrumbService,
        private modalService: NgbModal,
        private dateService: DateService,
        private responseService: ResponseService,
        private errorService: ErrorService
    ) {
    }

    ngOnInit(): void {

        this.route.params.subscribe(params => {

            const dateId = params["dateId"];
            this.isNew = dateId === "add";

            if (!this.isNew) {

                this.date.dateId = dateId;
                this.loadDate();

                this.datesInQuarterSearchOptions.quarterId = dateId;
                this.datesInQuarterSearchOptions.includeParents = true;
                this.searchDatesInQuarter();

                this.datesInYearSearchOptions.yearId = dateId;
                this.datesInYearSearchOptions.includeParents = true;
                this.searchDatesInYear();

                this.responsesSearchOptions.dateId = dateId;
                this.responsesSearchOptions.includeParents = true;
                this.searchResponses();

            }

        });

    }

    private loadDate(): void {

        this.dateService.get(this.date.dateId)
            .subscribe({
                next: date => {
                    this.date = date;
                    this.changeBreadcrumb();
                },
                error: err => {
                    this.errorService.handleError(err, "Date", "Load");
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

        this.dateService.save(this.date)
            .subscribe({
                next: date => {
                    this.toastr.success("The date has been saved", "Save Date");
                    if (this.isNew) this.router.navigate(["../", date.dateId], { relativeTo: this.route });
                },
                error: err => {
                    this.errorService.handleError(err, "Date", "Save");
                }
            });

    }

    delete(): void {

        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Date", text: "Are you sure you want to delete this date?", deleteStyle: true, ok: "Delete" } as ConfirmModalOptions;
        modalRef.result.then(
            () => {

                this.dateService.delete(this.date.dateId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The date has been deleted", "Delete Date");
                            this.router.navigate(["../"], { relativeTo: this.route });
                        },
                        error: err => {
                            this.errorService.handleError(err, "Date", "Delete");
                        }
                    });

            }, () => { });
    }

    changeBreadcrumb(): void {
        this.breadcrumbService.changeBreadcrumb(this.route.snapshot, this.date.name !== undefined ? this.date.name.substring(0, 25) : "(new date)");
    }

    searchDatesInQuarter(pageIndex = 0): Subject<DateSearchResponse> {

        this.datesInQuarterSearchOptions.pageIndex = pageIndex;

        const subject = new Subject<DateSearchResponse>()

        this.dateService.search(this.datesInQuarterSearchOptions)
            .subscribe({
                next: response => {
                    subject.next(response);
                    this.datesInQuarter = response.dates;
                    this.datesInQuarterHeaders = response.headers;
                },
                error: err => {
                    this.errorService.handleError(err, "Dates in Quarter", "Load");
                }
            });

        return subject;

    }

    goToDateInQuarter(date: Date): void {
        this.router.navigate([date.dateId], { relativeTo: this.route });
    }

    deleteDateInQuarter(date: Date, event: MouseEvent): void {
        event.stopPropagation();

        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Date", text: "Are you sure you want to delete this date?", deleteStyle: true, ok: "Delete" } as ConfirmModalOptions;
        modalRef.result.then(
            () => {

                this.dateService.delete(date.dateId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The date has been deleted", "Delete Date");
                            this.searchDatesInQuarter(this.datesInQuarterHeaders.pageIndex);
                        },
                        error: err => {
                            this.errorService.handleError(err, "Date", "Delete");
                        }
                    });

            }, () => { });
    }

    deleteDatesInQuarter(): void {
        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Dates", text: "Are you sure you want to delete all the dates in quarter?", deleteStyle: true, ok: "Delete" } as ConfirmModalOptions;
        modalRef.result.then(
            () => {

                this.dateService.deleteDatesInQuarter(this.date.dateId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The dates in quarter have been deleted", "Delete Dates in Quarter");
                            this.searchDatesInQuarter();
                        },
                        error: err => {
                            this.errorService.handleError(err, "Dates in Quarter", "Delete");
                        }
                    });
            }, () => { });

    }

    searchDatesInYear(pageIndex = 0): Subject<DateSearchResponse> {

        this.datesInYearSearchOptions.pageIndex = pageIndex;

        const subject = new Subject<DateSearchResponse>()

        this.dateService.search(this.datesInYearSearchOptions)
            .subscribe({
                next: response => {
                    subject.next(response);
                    this.datesInYear = response.dates;
                    this.datesInYearHeaders = response.headers;
                },
                error: err => {
                    this.errorService.handleError(err, "Dates in Year", "Load");
                }
            });

        return subject;

    }

    goToDateInYear(date: Date): void {
        this.router.navigate([date.dateId], { relativeTo: this.route });
    }

    deleteDateInYear(date: Date, event: MouseEvent): void {
        event.stopPropagation();

        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Date", text: "Are you sure you want to delete this date?", deleteStyle: true, ok: "Delete" } as ConfirmModalOptions;
        modalRef.result.then(
            () => {

                this.dateService.delete(date.dateId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The date has been deleted", "Delete Date");
                            this.searchDatesInYear(this.datesInYearHeaders.pageIndex);
                        },
                        error: err => {
                            this.errorService.handleError(err, "Date", "Delete");
                        }
                    });

            }, () => { });
    }

    deleteDatesInYear(): void {
        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Dates", text: "Are you sure you want to delete all the dates in year?", deleteStyle: true, ok: "Delete" } as ConfirmModalOptions;
        modalRef.result.then(
            () => {

                this.dateService.deleteDatesInYear(this.date.dateId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The dates in year have been deleted", "Delete Dates in Year");
                            this.searchDatesInYear();
                        },
                        error: err => {
                            this.errorService.handleError(err, "Dates in Year", "Delete");
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
        this.router.navigate(["/questionnaires", response.questionnaire.questionnaireId, "responses", response.responseId]);
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

                this.dateService.deleteResponses(this.date.dateId)
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

}
