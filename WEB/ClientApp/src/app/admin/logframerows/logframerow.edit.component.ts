import { Component as NgComponent, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmModalComponent, ConfirmModalOptions } from '../../common/components/confirm.component';
import { PagingHeaders } from '../../common/models/http.model';
import { LogFrameRow } from '../../common/models/logframerow.model';
import { Enum, Enums } from '../../common/models/enums.model';
import { BreadcrumbService } from '../../common/services/breadcrumb.service';
import { ErrorService } from '../../common/services/error.service';
import { LogFrameRowService } from '../../common/services/logframerow.service';
import { LogFrameRowComponent, LogFrameRowComponentSearchOptions, LogFrameRowComponentSearchResponse } from '../../common/models/logframerowcomponent.model';
import { LogFrameRowComponentService } from '../../common/services/logframerowcomponent.service';
import { LogFrameRowIndicator, LogFrameRowIndicatorSearchOptions, LogFrameRowIndicatorSearchResponse } from '../../common/models/logframerowindicator.model';
import { LogFrameRowIndicatorService } from '../../common/services/logframerowindicator.service';
import { IndicatorModalComponent } from '../indicators/indicator.modal.component';
import { Indicator } from '../../common/models/indicator.model';
import { ComponentModalComponent } from '../components/component.modal.component';
import { Component } from '../../common/models/component.model';

@NgComponent({
    selector: 'logframerow-edit',
    templateUrl: './logframerow.edit.component.html'
})
export class LogFrameRowEditComponent implements OnInit, OnDestroy {

    public logFrameRow: LogFrameRow = new LogFrameRow();
    public isNew = true;
    private routerSubscription: Subscription;
    public logFrameRowTypes: Enum[] = Enums.LogFrameRowTypes;

    public logFrameRowIndicatorsSearchOptions = new LogFrameRowIndicatorSearchOptions();
    public logFrameRowIndicatorsHeaders = new PagingHeaders();
    public logFrameRowIndicators: LogFrameRowIndicator[] = [];
    public showLogFrameRowIndicatorsSearch = false;

    public logFrameRowComponentsSearchOptions = new LogFrameRowComponentSearchOptions();
    public logFrameRowComponentsHeaders = new PagingHeaders();
    public logFrameRowComponents: LogFrameRowComponent[] = [];
    public showLogFrameRowComponentsSearch = false;

    @ViewChild('indicatorModal') indicatorModal: IndicatorModalComponent;
    @ViewChild('componentModal') componentModal: ComponentModalComponent;

    constructor(
        private router: Router,
        public route: ActivatedRoute,
        private toastr: ToastrService,
        private breadcrumbService: BreadcrumbService,
        private modalService: NgbModal,
        private logFrameRowService: LogFrameRowService,
        private logFrameRowComponentService: LogFrameRowComponentService,
        private logFrameRowIndicatorService: LogFrameRowIndicatorService,
        private errorService: ErrorService
    ) {
    }

    ngOnInit(): void {

        this.route.params.subscribe(params => {

            const logFrameRowId = params["logFrameRowId"];
            this.logFrameRow.logFrameId = this.route.snapshot.parent.params.logFrameId;
            this.isNew = logFrameRowId === "add";

            if (!this.isNew) {

                this.logFrameRow.logFrameRowId = logFrameRowId;
                this.loadLogFrameRow();

                this.logFrameRowIndicatorsSearchOptions.logFrameRowId = logFrameRowId;
                this.logFrameRowIndicatorsSearchOptions.includeParents = true;
                this.searchLogFrameRowIndicators();

                this.logFrameRowComponentsSearchOptions.logFrameRowId = logFrameRowId;
                this.logFrameRowComponentsSearchOptions.includeParents = true;
                this.searchLogFrameRowComponents();

            }

            this.routerSubscription = this.router.events.subscribe(event => {
                if (event instanceof NavigationEnd && !this.route.firstChild) {
                    // this will double-load on new save, as params change (above) + nav ends
                    this.searchLogFrameRowIndicators();
                    this.searchLogFrameRowComponents();
                }
            });

        });

    }

    ngOnDestroy(): void {
        this.routerSubscription.unsubscribe();
    }

    private loadLogFrameRow(): void {

        this.logFrameRowService.get(this.logFrameRow.logFrameRowId)
            .subscribe({
                next: logFrameRow => {
                    this.logFrameRow = logFrameRow;
                    this.changeBreadcrumb();
                },
                error: err => {
                    this.errorService.handleError(err, "LogFrame Row", "Load");
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

        this.logFrameRowService.save(this.logFrameRow)
            .subscribe({
                next: logFrameRow => {
                    this.toastr.success("The logframe row has been saved", "Save LogFrame Row");
                    if (this.isNew) {
                        this.ngOnDestroy();
                        this.router.navigate(["../", logFrameRow.logFrameRowId], { relativeTo: this.route });
                    }
                },
                error: err => {
                    this.errorService.handleError(err, "LogFrame Row", "Save");
                }
            });

    }

    delete(): void {

        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete LogFrame Row", text: "Are you sure you want to delete this logframe row?", deleteStyle: true, ok: "Delete" } as ConfirmModalOptions;
        modalRef.result.then(
            () => {

                this.logFrameRowService.delete(this.logFrameRow.logFrameRowId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The logframe row has been deleted", "Delete LogFrame Row");
                            this.router.navigate(["../../"], { relativeTo: this.route });
                        },
                        error: err => {
                            this.errorService.handleError(err, "LogFrame Row", "Delete");
                        }
                    });

            }, () => { });
    }

    changeBreadcrumb(): void {
        this.breadcrumbService.changeBreadcrumb(this.route.snapshot, this.logFrameRow.rowNumber !== undefined ? this.logFrameRow.rowNumber.toString().substring(0, 25) : "(new logframe row)");
    }

    searchLogFrameRowIndicators(pageIndex = 0): Subject<LogFrameRowIndicatorSearchResponse> {

        this.logFrameRowIndicatorsSearchOptions.pageIndex = pageIndex;

        const subject = new Subject<LogFrameRowIndicatorSearchResponse>()

        this.logFrameRowIndicatorService.search(this.logFrameRowIndicatorsSearchOptions)
            .subscribe({
                next: response => {
                    subject.next(response);
                    this.logFrameRowIndicators = response.logFrameRowIndicators;
                    this.logFrameRowIndicatorsHeaders = response.headers;
                },
                error: err => {
                    this.errorService.handleError(err, "Log Frame Row Indicators", "Load");
                }
            });

        return subject;

    }

    goToLogFrameRowIndicator(logFrameRowIndicator: LogFrameRowIndicator): void {
        this.router.navigate(["logframerowindicators", logFrameRowIndicator.indicatorId], { relativeTo: this.route });
    }

    addLogFrameRowIndicators(): void {
        this.indicatorModal.open();
    }

    changeIndicator(indicators: Indicator[]): void {
        if (!indicators.length) return;
        const indicatorIdList = indicators.map(o => o.indicatorId);
        this.logFrameRowService.saveLogFrameRowIndicators(this.logFrameRow.logFrameRowId, indicatorIdList)
            .subscribe({
                next: () => {
                    this.toastr.success("The log frame row indicators have been saved", "Save Log Frame Row Indicators");
                    this.searchLogFrameRowIndicators(this.logFrameRowIndicatorsHeaders.pageIndex);
                },
                error: err => {
                    this.errorService.handleError(err, "Log Frame Row Indicators", "Save");
                }
            });
    }

    deleteLogFrameRowIndicator(logFrameRowIndicator: LogFrameRowIndicator, event: MouseEvent): void {
        event.stopPropagation();

        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Log Frame Row Indicator", text: "Are you sure you want to delete this log frame row indicator?", deleteStyle: true, ok: "Delete" } as ConfirmModalOptions;
        modalRef.result.then(
            () => {

                this.logFrameRowIndicatorService.delete(logFrameRowIndicator.logFrameRowId, logFrameRowIndicator.indicatorId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The log frame row indicator has been deleted", "Delete Log Frame Row Indicator");
                            this.searchLogFrameRowIndicators(this.logFrameRowIndicatorsHeaders.pageIndex);
                        },
                        error: err => {
                            this.errorService.handleError(err, "Log Frame Row Indicator", "Delete");
                        }
                    });

            }, () => { });
    }

    deleteLogFrameRowIndicators(): void {
        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Log Frame Row Indicators", text: "Are you sure you want to delete all the log frame row indicators?", deleteStyle: true, ok: "Delete" } as ConfirmModalOptions;
        modalRef.result.then(
            () => {

                this.logFrameRowService.deleteLogFrameRowIndicators(this.logFrameRow.logFrameRowId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The log frame row indicators have been deleted", "Delete Log Frame Row Indicators");
                            this.searchLogFrameRowIndicators();
                        },
                        error: err => {
                            this.errorService.handleError(err, "Log Frame Row Indicators", "Delete");
                        }
                    });
            }, () => { });

    }

    searchLogFrameRowComponents(pageIndex = 0): Subject<LogFrameRowComponentSearchResponse> {

        this.logFrameRowComponentsSearchOptions.pageIndex = pageIndex;

        const subject = new Subject<LogFrameRowComponentSearchResponse>()

        this.logFrameRowComponentService.search(this.logFrameRowComponentsSearchOptions)
            .subscribe({
                next: response => {
                    subject.next(response);
                    this.logFrameRowComponents = response.logFrameRowComponents;
                    this.logFrameRowComponentsHeaders = response.headers;
                },
                error: err => {
                    this.errorService.handleError(err, "Log Frame Row Components", "Load");
                }
            });

        return subject;

    }

    goToLogFrameRowComponent(logFrameRowComponent: LogFrameRowComponent): void {
        this.router.navigate(["logframerowcomponents", logFrameRowComponent.componentId], { relativeTo: this.route });
    }

    addLogFrameRowComponents(): void {
        this.componentModal.open();
    }

    changeComponent(components: Component[]): void {
        if (!components.length) return;
        const componentIdList = components.map(o => o.componentId);
        this.logFrameRowService.saveLogFrameRowComponents(this.logFrameRow.logFrameRowId, componentIdList)
            .subscribe({
                next: () => {
                    this.toastr.success("The log frame row components have been saved", "Save Log Frame Row Components");
                    this.searchLogFrameRowComponents(this.logFrameRowComponentsHeaders.pageIndex);
                },
                error: err => {
                    this.errorService.handleError(err, "Log Frame Row Components", "Save");
                }
            });
    }

    deleteLogFrameRowComponent(logFrameRowComponent: LogFrameRowComponent, event: MouseEvent): void {
        event.stopPropagation();

        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Log Frame Row Component", text: "Are you sure you want to delete this log frame row component?", deleteStyle: true, ok: "Delete" } as ConfirmModalOptions;
        modalRef.result.then(
            () => {

                this.logFrameRowComponentService.delete(logFrameRowComponent.logFrameRowId, logFrameRowComponent.componentId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The log frame row component has been deleted", "Delete Log Frame Row Component");
                            this.searchLogFrameRowComponents(this.logFrameRowComponentsHeaders.pageIndex);
                        },
                        error: err => {
                            this.errorService.handleError(err, "Log Frame Row Component", "Delete");
                        }
                    });

            }, () => { });
    }

    deleteLogFrameRowComponents(): void {
        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Log Frame Row Components", text: "Are you sure you want to delete all the log frame row components?", deleteStyle: true, ok: "Delete" } as ConfirmModalOptions;
        modalRef.result.then(
            () => {

                this.logFrameRowService.deleteLogFrameRowComponents(this.logFrameRow.logFrameRowId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The log frame row components have been deleted", "Delete Log Frame Row Components");
                            this.searchLogFrameRowComponents();
                        },
                        error: err => {
                            this.errorService.handleError(err, "Log Frame Row Components", "Delete");
                        }
                    });
            }, () => { });

    }

}
