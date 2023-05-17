import { Component as NgComponent, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmModalComponent, ModalOptions } from '../../common/components/confirm.component';
import { PagingHeaders } from '../../common/models/http.model';
import { LogFrame } from '../../common/models/logframe.model';
import { Enum, Enums } from '../../common/models/enums.model';
import { BreadcrumbService } from '../../common/services/breadcrumb.service';
import { ErrorService } from '../../common/services/error.service';
import { LogFrameService } from '../../common/services/logframe.service';
import { LogFrameRow, LogFrameRowSearchOptions, LogFrameRowSearchResponse } from '../../common/models/logframerow.model';
import { LogFrameRowService } from '../../common/services/logframerow.service';
import { LogFrameRowSortComponent } from '../logframerows/logframerow.sort.component';

@NgComponent({
    selector: 'logframe-edit',
    templateUrl: './logframe.edit.component.html'
})
export class LogFrameEditComponent implements OnInit, OnDestroy {

    public logFrame: LogFrame = new LogFrame();
    public isNew = true;
    private routerSubscription: Subscription;
    public logFrameRowTypes: Enum[] = Enums.LogFrameRowTypes;

    public logFrameRowsSearchOptions = new LogFrameRowSearchOptions();
    public logFrameRowsHeaders = new PagingHeaders();
    public logFrameRows: LogFrameRow[] = [];
    public showLogFrameRowsSearch = false;

    constructor(
        private router: Router,
        public route: ActivatedRoute,
        private toastr: ToastrService,
        private breadcrumbService: BreadcrumbService,
        private modalService: NgbModal,
        private logFrameService: LogFrameService,
        private logFrameRowService: LogFrameRowService,
        private errorService: ErrorService
    ) {
    }

    ngOnInit(): void {

        this.route.params.subscribe(params => {

            const logFrameId = params["logFrameId"];
            this.isNew = logFrameId === "add";

            if (!this.isNew) {

                this.logFrame.logFrameId = logFrameId;
                this.loadLogFrame();

                this.logFrameRowsSearchOptions.logFrameId = logFrameId;
                this.logFrameRowsSearchOptions.includeParents = true;
                this.searchLogFrameRows();

            }

            this.routerSubscription = this.router.events.subscribe(event => {
                if (event instanceof NavigationEnd && !this.route.firstChild) {
                    // this will double-load on new save, as params change (above) + nav ends
                    this.searchLogFrameRows();
                }
            });

        });

    }

    ngOnDestroy(): void {
        this.routerSubscription.unsubscribe();
    }

    private loadLogFrame(): void {

        this.logFrameService.get(this.logFrame.logFrameId)
            .subscribe({
                next: logFrame => {
                    this.logFrame = logFrame;
                    this.changeBreadcrumb();
                },
                error: err => {
                    this.errorService.handleError(err, "Logical Framework", "Load");
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

        this.logFrameService.save(this.logFrame)
            .subscribe({
                next: logFrame => {
                    this.toastr.success("The logical framework has been saved", "Save Logical Framework");
                    if (this.isNew) {
                        this.ngOnDestroy();
                        this.router.navigate(["../", logFrame.logFrameId], { relativeTo: this.route });
                    }
                },
                error: err => {
                    this.errorService.handleError(err, "Logical Framework", "Save");
                }
            });

    }

    delete(): void {

        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Logical Framework", text: "Are you sure you want to delete this logical framework?", deleteStyle: true, ok: "Delete" } as ModalOptions;
        modalRef.result.then(
            () => {

                this.logFrameService.delete(this.logFrame.logFrameId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The logical framework has been deleted", "Delete Logical Framework");
                            this.router.navigate(["../"], { relativeTo: this.route });
                        },
                        error: err => {
                            this.errorService.handleError(err, "Logical Framework", "Delete");
                        }
                    });

            }, () => { });
    }

    changeBreadcrumb(): void {
        this.breadcrumbService.changeBreadcrumb(this.route.snapshot, this.logFrame.name !== undefined ? this.logFrame.name.substring(0, 25) : "(new logical framework)");
    }

    searchLogFrameRows(pageIndex = 0): Subject<LogFrameRowSearchResponse> {

        this.logFrameRowsSearchOptions.pageIndex = pageIndex;

        const subject = new Subject<LogFrameRowSearchResponse>()

        this.logFrameRowService.search(this.logFrameRowsSearchOptions)
            .subscribe({
                next: response => {
                    subject.next(response);
                    this.logFrameRows = response.logFrameRows;
                    this.logFrameRowsHeaders = response.headers;
                },
                error: err => {
                    this.errorService.handleError(err, "LogFrame Rows", "Load");
                }
            });

        return subject;

    }

    goToLogFrameRow(logFrameRow: LogFrameRow): void {
        this.router.navigate(["logframerows", logFrameRow.logFrameRowId], { relativeTo: this.route });
    }

    deleteLogFrameRow(logFrameRow: LogFrameRow, event: MouseEvent): void {
        event.stopPropagation();

        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete LogFrame Row", text: "Are you sure you want to delete this logframe row?", deleteStyle: true, ok: "Delete" } as ModalOptions;
        modalRef.result.then(
            () => {

                this.logFrameRowService.delete(logFrameRow.logFrameRowId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The logframe row has been deleted", "Delete LogFrame Row");
                            this.searchLogFrameRows(this.logFrameRowsHeaders.pageIndex);
                        },
                        error: err => {
                            this.errorService.handleError(err, "LogFrame Row", "Delete");
                        }
                    });

            }, () => { });
    }

    deleteLogFrameRows(): void {
        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete LogFrame Rows", text: "Are you sure you want to delete all the logframe rows?", deleteStyle: true, ok: "Delete" } as ModalOptions;
        modalRef.result.then(
            () => {

                this.logFrameService.deleteLogFrameRows(this.logFrame.logFrameId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The logframe rows have been deleted", "Delete LogFrame Rows");
                            this.searchLogFrameRows();
                        },
                        error: err => {
                            this.errorService.handleError(err, "LogFrame Rows", "Delete");
                        }
                    });
            }, () => { });

    }

    showLogFrameRowSort(): void {
        let modalRef = this.modalService.open(LogFrameRowSortComponent, { size: 'xl', centered: true, scrollable: false });
        (modalRef.componentInstance as LogFrameRowSortComponent).logFrameId = this.logFrame.logFrameId;
        modalRef.result.then(
            () => this.searchLogFrameRows(this.logFrameRowsHeaders.pageIndex),
            () => { }
        );
    }

}
