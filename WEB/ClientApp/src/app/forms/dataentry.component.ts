import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { ProfileModel } from '../common/models/profile.models';
import { AuthService } from '../common/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute } from '@angular/router';
import { ErrorService } from '../common/services/error.service';
import { NgForm } from '@angular/forms';
import { DataEntryFormResponse, FormsService } from '../common/services/forms.service';
import { Datum, DataEntryDatum } from '../common/models/datum.model';
import { DateService } from '../common/services/date.service';
import { EntityService } from '../common/services/entity.service';
import { forkJoin, Observable, of, throwError } from 'rxjs';
import { Entity } from '../common/models/entity.model';
import { AppDate as myDate } from '../common/models/date.model';
import { catchError, share } from 'rxjs/operators';
import { PendingRequestsInterceptorConfigurer } from 'ng-http-loader';
import { Organisation } from '../common/models/organisation.model';
import moment from 'moment';
import { Indicator } from '../common/models/indicator.model';
import { Enums, PermissionTypes, ReviewResults, ReviewStatuses, Roles } from '../common/models/enums.model';
import { CategoryRow, IndicatorRow, IndicatorRowState, SubcategoryRow } from '../common/models/dataentry.model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DatumStatusModalComponent } from './datumstatus.modal.component';
import { DataReviewModalComponent } from './datareview.modal';
import { AppSettings } from '../common/models/appsettings.model';
import { AppService } from '../common/services/app.service';

@Component({
    selector: 'dataentry',
    templateUrl: './dataentry.component.html',
    styleUrls: ['./dataentry.component.css'],
    standalone: false
})
export class DataEntryComponent implements OnInit, AfterViewInit {

    public options = { entityId: null as string, entity: null as Entity, dateId: null as string, date: null as myDate, permissionType: PermissionTypes.Edit };
    public loaded = false;
    public profile: ProfileModel;
    public categoryRows: CategoryRow[] = [];
    public organisation: Organisation;
    public showSubmitCol = false;
    public showVerifyCol = false;
    public showApproveCol = false;
    public canSave = false; // todo: not needed? can use dateIsOpen?
    public canEdit = false;
    public canSubmit = false;
    public canVerify = false;
    public canApprove = false;
    public canReject = false;
    public dateIsOpen = false;
    private blockSave = true;
    public isOpen = undefined as boolean;
    public hasOpened = undefined as boolean;
    public permissionTypes = Enums.PermissionTypes;
    private appSettings: AppSettings;

    @ViewChild("optionsForm") form: NgForm;
    @ViewChild("accordion") accordion: any;

    constructor(
        private authService: AuthService,
        private appService: AppService,
        private toastr: ToastrService,
        private errorService: ErrorService,
        private formsService: FormsService,
        private dateService: DateService,
        private entityService: EntityService,
        private route: ActivatedRoute,
        pendingRequestsInterceptor: PendingRequestsInterceptorConfigurer,
        private modalService: NgbModal
    ) {
        // disabled this otherwise the route is nuked each time and (eg) the nav controller initialises again
        //this.router.routeReuseStrategy.shouldReuseRoute = () => false;
        pendingRequestsInterceptor.pendingRequestsStatus$.subscribe(pending => {
            if (!pending) {
                this.blockSave = false;
            } else {
                this.blockSave = true;
            }
        });
    }

    ngOnInit(): void {

        // permissions independent of indicators
        this.authService.canEdit().subscribe(canEdit => this.canEdit = canEdit);
        this.authService.canSubmit().subscribe(canSubmit => this.canSubmit = canSubmit);
        this.authService.canVerify().subscribe(canVerify => this.canVerify = canVerify);
        this.authService.canApprove().subscribe(canApprove => this.canApprove = canApprove);

        this.appService.getAppSettings().subscribe(appSettings => this.appSettings = appSettings);

        this.authService.getProfile()
            .subscribe(
                profile => {
                    this.profile = profile;
                    this.organisation = profile.organisation;

                    // the form defaults to edit, if the user doesn't have the ability, switch to view
                    if (!this.canEdit) this.options.permissionType = PermissionTypes.View;

                })

        this.authService.isInRole$(Roles.Administrator)
            .subscribe({
                next: result => {
                    if (result) {
                        // todo: remove these? legacy from RURA?
                        this.canReject = true;
                        this.organisation = undefined;
                        this.isOpen = null;
                        this.hasOpened = true;
                    } else {

                        this.authService.isInRole$(Roles.Oversight)
                            .subscribe({
                                next: result => {
                                    if (result) {
                                        this.isOpen = null;
                                        this.hasOpened = true;
                                    }
                                }
                            });

                    }
                }
            });

        // ****************** temp for development
        //if (window.location.hostname === "localhost") {
        //    forkJoin({
        //        dates: this.dateService.search({ pageSize: 1, isOpen: true } as DateSearchOptions),
        //        entities: this.entityService.search({ pageSize: 1, role: Roles.Administrator, q: 'uganda' } as EntitySearchOptions)
        //    }).subscribe({
        //        next: response => {
        //            this.options.date = response.dates.dates[0];
        //            this.options.dateId = response.dates.dates[0].dateId;
        //            this.options.entity = response.entities.entities[0];
        //            this.options.entityId = this.options.entity.entityId;
        //            this.options.permissionType = PermissionTypes.Approve;
        //            setTimeout(() => this.load(this.form));
        //        },
        //        error: () => this.toastr.error("Failed to load some of the test data")
        //    });
        //}
    }

    ngAfterViewInit(): void {

        const entityId = this.route.snapshot.queryParams["entityid"];
        const dateId = this.route.snapshot.queryParams["dateid"];

        if (entityId && dateId) {

            const entityGet = this.entityService.get(entityId).pipe(catchError(err => { this.errorService.handleError(err, "Entity", "Load"); return throwError(() => err); }));
            const dateGet = this.dateService.get(dateId).pipe(catchError(err => { this.errorService.handleError(err, "Date", "Load"); return throwError(() => err); }));

            forkJoin({ entity: entityGet, date: dateGet })
                .subscribe({
                    next: response => {
                        this.options.entity = response.entity;
                        this.options.entityId = this.options.entity.entityId;
                        this.options.date = response.date;
                        this.options.dateId = this.options.date.dateId;

                        setTimeout(() => this.load(this.form));

                    },
                    error: err => {
                        console.log(err);
                        this.options.entityId = undefined;
                        this.options.entity = undefined;
                        this.options.dateId = undefined;
                        this.options.date = undefined;
                    }
                });

        }

    }

    load(form: NgForm) {

        if (form.invalid) {
            this.toastr.error("The form has not been completed correctly.", "Error");
            return;
        }

        this.dateIsOpen = moment(this.options.date.openFrom as any).startOf("day") <= moment().startOf("day")
            && moment(this.options.date.openTo as any).startOf("day") >= moment().startOf("day")

        if (!this.dateIsOpen) this.canSave = false;

        // todo: still using orgId?
        //this.canSave = this.profile.organisationId === this.options.entity.organisationId && this.dateIsOpen;
        this.canSave = this.dateIsOpen;

        this.formsService.loadDataEntry(this.options.entityId, this.options.dateId, this.options.permissionType)
            .subscribe({
                next: data => {

                    this.categoryRows = [];
                    this.setForm(data);
                    this.loaded = true;

                },
                error: err => {

                    this.errorService.handleError(err, "Data Entry Form", "Load");

                }
            });

    }

    save(form: NgForm): Observable<{ indicators: Indicator[], data: Datum[] }> {

        if (this.blockSave) {
            this.toastr.warning("Please wait until the system has finished loading.", "System Busy");
            return of(null);
        }

        if (form.invalid) {
            this.toastr.error("The form has not been completed correctly.", "Error");
            return of(null);
        }

        const data: DataEntryDatum[] = [];
        this.categoryRows.forEach(categoryRow => {
            categoryRow.subcategoryRows.forEach(subcategoryRow => {
                subcategoryRow.indicatorRows.forEach(indicatorRow => {
                    // allow saving of non-sub/app data
                    if (!indicatorRow.datum.submitted && !indicatorRow.datum.approved && (indicatorRow.changed)) {
                        data.push(
                            {
                                dateId: indicatorRow.datum.dateId,
                                entityId: indicatorRow.datum.entityId,
                                indicatorId: indicatorRow.datum.indicatorId,
                                value: indicatorRow.datum.value,
                                note: indicatorRow.datum.note
                            }
                        );
                    }
                })
            })
        });

        if (data.length === 0) {
            this.toastr.error("There are no changes to the data entry form.", "No Changed Detected");
            return of(null);
        }

        const observable = this.formsService.saveDataEntry(this.options.entityId, this.options.dateId, data)
            .pipe(share());

        observable.subscribe({
            next: data => {

                this.setForm(data);
                this.toastr.success("The Data Entry form has been saved", "Save Data Entry Form");

            },
            error: err => this.errorService.handleError(err, "Data Entry Form", "Save")
        });

        return observable;

    }

    submit(): void {

        const indicatorRows = this.getSelectedIndicators();

        if (!indicatorRows.length) {
            this.toastr.error("No indicators have been marked for submission");
            return;
        }

        let modalRef = this.modalService.open(DataReviewModalComponent, { size: 'xl', centered: true, scrollable: true });
        (modalRef.componentInstance as DataReviewModalComponent).setData(indicatorRows, ReviewStatuses.Submit, ReviewResults.Accepted, this.options.entity, this.options.date);
        modalRef.result.then(
            (response: DataEntryFormResponse) => this.setForm(response),
            () => { }
        );
    }

    verify(): void {

        const indicatorRows = this.getSelectedIndicators();

        if (!indicatorRows.length) {
            this.toastr.error("No indicators have been marked for verification");
            return;
        }

        let modalRef = this.modalService.open(DataReviewModalComponent, { size: 'xl', centered: true, scrollable: true });
        (modalRef.componentInstance as DataReviewModalComponent).setData(indicatorRows, ReviewStatuses.Verify, ReviewResults.Accepted, this.options.entity, this.options.date);
        modalRef.result.then(
            (response: DataEntryFormResponse) => this.setForm(response),
            () => { }
        );
    }

    approve(): void {

        const indicatorRows = this.getSelectedIndicators();

        if (!indicatorRows.length) {
            this.toastr.error("No indicators have been marked for approval");
            return;
        }

        let modalRef = this.modalService.open(DataReviewModalComponent, { size: 'xl', centered: true, scrollable: true });
        (modalRef.componentInstance as DataReviewModalComponent).setData(indicatorRows, ReviewStatuses.Approve, ReviewResults.Accepted, this.options.entity, this.options.date);
        modalRef.result.then(
            (response: DataEntryFormResponse) => this.setForm(response),
            () => { }
        );
    }

    reject(): void {

        const indicatorRows = this.getSelectedIndicators();

        if (!indicatorRows.length) {
            this.toastr.error("No indicators have been marked for rejection");
            return;
        }

        var status: ReviewStatuses;
        if (this.options.permissionType === PermissionTypes.Submit) status = ReviewStatuses.Submit;
        else if (this.options.permissionType === PermissionTypes.Verify) status = ReviewStatuses.Verify;
        else if (this.options.permissionType === PermissionTypes.Approve) status = ReviewStatuses.Approve;
        else throw "Invalid permissionType in reject()";

        let modalRef = this.modalService.open(DataReviewModalComponent, { size: 'xl', centered: true, scrollable: true });
        (modalRef.componentInstance as DataReviewModalComponent).setData(indicatorRows, status, ReviewResults.Rejected, this.options.entity, this.options.date);
        modalRef.result.then(
            (response: DataEntryFormResponse) => this.setForm(response),
            () => { }
        );

    }

    private getSelectedIndicators(): IndicatorRow[] {
        const indicatorRows: IndicatorRow[] = [];
        this.categoryRows.forEach(categoryRow => {
            categoryRow.subcategoryRows.forEach(subcategoryRow => {
                subcategoryRow.indicatorRows.forEach(indicatorRow => {
                    if (indicatorRow.checked && indicatorRow.canCheck)
                        indicatorRows.push(indicatorRow);
                })
            })
        });
        return indicatorRows;
    }

    private setForm(response: DataEntryFormResponse) {

        // todo: view should show all cols?
        this.showSubmitCol = this.appSettings.useSubmit && this.options.permissionType >= 2; // todo: use enums?
        this.showVerifyCol = this.appSettings.useVerify && this.options.permissionType >= 3; // todo: use enums?
        this.showApproveCol = this.appSettings.useApprove && this.options.permissionType === PermissionTypes.Approve;

        // recreate the form from scratch
        this.categoryRows = [];

        response.indicators.forEach(indicator => {

            let categoryRow = this.categoryRows.filter(o => o.category.categoryId === indicator.subcategory.categoryId)[0];
            if (!categoryRow) {
                categoryRow = { category: indicator.subcategory.category, subcategoryRows: [] };
                this.categoryRows.push(categoryRow);
            }

            let subcategoryRow = categoryRow.subcategoryRows.filter(o => o.subcategory.subcategoryId === indicator.subcategoryId)[0];
            if (!subcategoryRow) {
                subcategoryRow = { subcategory: indicator.subcategory, indicatorRows: [] };
                categoryRow.subcategoryRows.push(subcategoryRow);
            }

            let row = subcategoryRow.indicatorRows.filter(o => o.indicator.indicatorId === indicator.indicatorId)[0];
            if (!row) {
                row = {
                    indicator: indicator,
                    units: indicator.units,
                    datum: null,
                    changed: false,
                    state: IndicatorRowState.edit,
                    canEdit: false,
                    checked: false,
                    canCheck: false
                };
                subcategoryRow.indicatorRows.push(row);
            } else {
                row.changed = false;
            }

            let datum: Datum;;
            const data = response.data.filter(datum => datum.indicatorId === indicator.indicatorId);
            if (data.length === 0) {
                datum = new Datum();
                datum.entityId = this.options.entityId;
                datum.dateId = this.options.dateId;
                datum.indicatorId = indicator.indicatorId;
                datum.indicator = indicator;
            } else if (data.length === 1) {
                datum = data[0];
                if (datum.approved) row.state = IndicatorRowState.approved;
                else if (datum.verified) row.state = IndicatorRowState.verified;
                else if (datum.submitted) row.state = IndicatorRowState.submitted;
            } else if (data.length > 1) {
                throw "Data should only contain one fact per indicator";
            }

            row.datum = datum;
            row.canEdit = row.state === IndicatorRowState.edit && this.canEdit && this.options.permissionType === PermissionTypes.Edit;

            if (this.options.permissionType === PermissionTypes.Submit) row.canCheck = this.canSubmit && !datum.submitted && indicator.requiresSubmit;
            else if (this.options.permissionType === PermissionTypes.Verify) row.canCheck = this.canVerify && !datum.verified && indicator.requiresVerify && (!indicator.requiresSubmit || datum.submitted);
            else if (this.options.permissionType === PermissionTypes.Approve) row.canCheck = this.canApprove && !datum.approved && indicator.requiresApprove && (!indicator.requiresSubmit || datum.submitted) && (!indicator.requiresVerify || datum.verified);

            if (this.options.permissionType === PermissionTypes.Submit && datum.submitted) row.checked = true;
            else if (this.options.permissionType === PermissionTypes.Verify && datum.verified) row.checked = true;
            else if (this.options.permissionType === PermissionTypes.Approve && datum.approved) row.checked = true;
        })

        setTimeout(() => this.accordion.expandAll());
    }

    close() {
        this.loaded = false;
    }

    setChanged(row: IndicatorRow) {
        row.changed = true;
    }

    getSubcategoryTotal(subcategoryRow: SubcategoryRow): number {
        let result = 0;

        subcategoryRow.indicatorRows.forEach(indicatorRow => {
            if (indicatorRow.datum.value) result += indicatorRow.datum.value;
        });

        return result;
    }

    getStatusTooltip(row: IndicatorRow): string {
        if (row.datum.rejected) return "Rejected";
        if (row.state === IndicatorRowState.edit) return "Editable";
        if (row.state === IndicatorRowState.submitted) return "Submitted";
        if (row.state === IndicatorRowState.verified) return "Verified";
        if (row.state === IndicatorRowState.approved) return "Approved";
        throw "Invalid IndicatorRowState";
    }

    showRowStatus(row: IndicatorRow): void {

        let modalRef = this.modalService.open(DatumStatusModalComponent, { size: 'lg', centered: true, scrollable: true });
        (modalRef.componentInstance as DatumStatusModalComponent).setData(row.datum, row.indicator, this.options.entity, this.options.date);
        modalRef.result.then(
            () => { },
            () => { }
        );
    }

    selectSubcategory(subcategoryRow: SubcategoryRow, permissionType: PermissionTypes): void {
        if (permissionType !== this.options.permissionType) return;
        subcategoryRow.indicatorRows.forEach(indicatorRow => {
            if (indicatorRow.canCheck) indicatorRow.checked = true;
        });
    }

    checkClick(indicatorRow: IndicatorRow): void {
        if (!indicatorRow.canCheck) return;
        indicatorRow.checked = !indicatorRow.checked;
    }

    getSubmitClass(indicatorRow: IndicatorRow): string {
        if (!indicatorRow.indicator.requiresSubmit) return "d-none";
        if (this.options.permissionType === PermissionTypes.Submit) {
            if (indicatorRow.datum.submitted) return "fa-square-check text-muted";
            else if (indicatorRow.checked) return "fa-square-check cursor-pointer";
            else return "fa-square cursor-pointer";
        } else {
            if (indicatorRow.datum.submitted) return "fa-square-check text-muted";
            else return "fa-square text-muted";
        }
    }

    getVerifyClass(indicatorRow: IndicatorRow): string {
        if (!indicatorRow.indicator.requiresVerify) return "d-none";
        if (this.options.permissionType === PermissionTypes.Verify) {
            if (indicatorRow.datum.verified) return "fa-square-check text-muted";
            else if (indicatorRow.checked) return "fa-square-check cursor-pointer";
            else if (this.appSettings.useSubmit && indicatorRow.indicator.requiresSubmit && !indicatorRow.datum.submitted) return "fa-square text-muted";
            return "fa-square cursor-pointer";
        } else {
            if (indicatorRow.datum.verified) return "fa-square-check text-muted";
            else return "fa-square text-muted";
        }
    }

    getApproveClass(indicatorRow: IndicatorRow): string {
        if (!indicatorRow.indicator.requiresApprove) return "d-none";
        if (this.options.permissionType === PermissionTypes.Approve) {
            if (indicatorRow.datum.approved) return "fa-square-check text-muted";
            else if (indicatorRow.checked) return "fa-square-check cursor-pointer";
            else if (this.appSettings.useSubmit && indicatorRow.indicator.requiresSubmit && !indicatorRow.datum.submitted) return "fa-square text-muted";
            else if (this.appSettings.useVerify && indicatorRow.indicator.requiresVerify && !indicatorRow.datum.verified) return "fa-square text-muted";
            return "fa-square cursor-pointer";
        } else {
            if (indicatorRow.datum.approved) return "fa-square-check text-muted";
            else return "fa-square text-muted";
        }
    }
}

