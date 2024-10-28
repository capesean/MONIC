import { Component as NgComponent, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmModalComponent, ConfirmModalOptions } from '../../common/components/confirm.component';
import { PagingHeaders } from '../../common/models/http.model';
import { Field } from '../../common/models/field.model';
import { Enum, Enums, FieldTypes } from '../../common/models/enums.model';
import { FadeThenShrink } from '../../common/animations/fadethenshrink';
import { BreadcrumbService } from '../../common/services/breadcrumb.service';
import { ErrorService } from '../../common/services/error.service';
import { FieldService } from '../../common/services/field.service';
import { Option, OptionSearchOptions, OptionSearchResponse } from '../../common/models/option.model';
import { OptionService } from '../../common/services/option.service';
import { OptionSortComponent } from '../options/option.sort.component';

@NgComponent({
    selector: 'field-edit',
    templateUrl: './field.edit.component.html',
    animations: [FadeThenShrink]
})
export class FieldEditComponent implements OnInit, OnDestroy {

    public field: Field = new Field();
    public isNew = true;
    private routerSubscription: Subscription;
    public fieldTypes: Enum[] = Enums.FieldTypes;
    public sizes: Enum[] = Enums.Sizes;

    public optionsSearchOptions = new OptionSearchOptions();
    public optionsHeaders = new PagingHeaders();
    public options: Option[] = [];
    public showOptionsSearch = false;

    public showOptions = false;

    constructor(
        private router: Router,
        public route: ActivatedRoute,
        private toastr: ToastrService,
        private breadcrumbService: BreadcrumbService,
        private modalService: NgbModal,
        private fieldService: FieldService,
        private optionService: OptionService,
        private errorService: ErrorService
    ) {
    }

    ngOnInit(): void {

        this.route.params.subscribe(params => {

            const fieldId = params["fieldId"];
            this.isNew = fieldId === "add";

            if (!this.isNew) {

                this.field.fieldId = fieldId;
                this.loadField();

                this.optionsSearchOptions.fieldId = fieldId;
                this.optionsSearchOptions.includeParents = true;
                this.searchOptions();

            }

            this.routerSubscription = this.router.events.subscribe(event => {
                if (event instanceof NavigationEnd && !this.route.firstChild) {
                    // this will double-load on new save, as params change (above) + nav ends
                    this.searchOptions();
                }
            });

        });

    }

    ngOnDestroy(): void {
        this.routerSubscription.unsubscribe();
    }

    private loadField(): void {

        this.fieldService.get(this.field.fieldId)
            .subscribe({
                next: field => {
                    this.field = field;
                    this.changeBreadcrumb();
                    if (this.field.fieldType === FieldTypes.Picklist) this.showOptions = true;
                },
                error: err => {
                    this.errorService.handleError(err, "Field", "Load");
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

        this.fieldService.save(this.field)
            .subscribe({
                next: field => {
                    this.toastr.success("The field has been saved", "Save Field");
                    if (this.isNew) {
                        this.ngOnDestroy();
                        this.router.navigate(["../", field.fieldId], { relativeTo: this.route });
                    } else if (this.field.fieldType === FieldTypes.Picklist) {
                        this.showOptions = true;
                    }
                },
                error: err => {
                    this.errorService.handleError(err, "Field", "Save");
                }
            });

    }

    delete(): void {

        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Field", text: "Are you sure you want to delete this field?", deleteStyle: true, ok: "Delete" } as ConfirmModalOptions;
        modalRef.result.then(
            () => {

                this.fieldService.delete(this.field.fieldId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The field has been deleted", "Delete Field");
                            this.router.navigate(["../"], { relativeTo: this.route });
                        },
                        error: err => {
                            this.errorService.handleError(err, "Field", "Delete");
                        }
                    });

            }, () => { });
    }

    changeBreadcrumb(): void {
        this.breadcrumbService.changeBreadcrumb(this.route.snapshot, this.field.name !== undefined ? this.field.name.substring(0, 25) : "(new field)");
    }

    searchOptions(pageIndex = 0): Subject<OptionSearchResponse> {

        this.optionsSearchOptions.pageIndex = pageIndex;

        const subject = new Subject<OptionSearchResponse>()

        this.optionService.search(this.optionsSearchOptions)
            .subscribe({
                next: response => {
                    subject.next(response);
                    this.options = response.options;
                    this.optionsHeaders = response.headers;
                },
                error: err => {
                    this.errorService.handleError(err, "Options", "Load");
                }
            });

        return subject;

    }

    goToOption(option: Option): void {
        this.router.navigate(["options", option.optionId], { relativeTo: this.route });
    }

    deleteOption(option: Option, event: MouseEvent): void {
        event.stopPropagation();

        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Option", text: "Are you sure you want to delete this option?", deleteStyle: true, ok: "Delete" } as ConfirmModalOptions;
        modalRef.result.then(
            () => {

                this.optionService.delete(option.optionId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The option has been deleted", "Delete Option");
                            this.searchOptions(this.optionsHeaders.pageIndex);
                        },
                        error: err => {
                            this.errorService.handleError(err, "Option", "Delete");
                        }
                    });

            }, () => { });
    }

    deleteOptions(): void {
        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Options", text: "Are you sure you want to delete all the options?", deleteStyle: true, ok: "Delete" } as ConfirmModalOptions;
        modalRef.result.then(
            () => {

                this.fieldService.deleteOptions(this.field.fieldId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The options have been deleted", "Delete Options");
                            this.searchOptions();
                        },
                        error: err => {
                            this.errorService.handleError(err, "Options", "Delete");
                        }
                    });
            }, () => { });

    }

    showOptionSort(): void {
        let modalRef = this.modalService.open(OptionSortComponent, { size: 'xl', centered: true, scrollable: false });
        (modalRef.componentInstance as OptionSortComponent).fieldId = this.field.fieldId;
        modalRef.result.then(
            () => this.searchOptions(this.optionsHeaders.pageIndex),
            () => { }
        );
    }

    showUnique(): boolean {
        return this.field && this.field.fieldType === FieldTypes.Text;
    }

    showLengths(): boolean {
        return this.field && this.field.fieldType === FieldTypes.Text;
    }

    showRegex(): boolean {
        return this.field && this.field.fieldType === FieldTypes.Text;
    }

    isPicklist(): boolean {
        return this.field && this.field.fieldType === FieldTypes.Picklist;
    }

    showMultiLine(): boolean {
        return this.field && this.field.fieldType === FieldTypes.Text;
    }

}
