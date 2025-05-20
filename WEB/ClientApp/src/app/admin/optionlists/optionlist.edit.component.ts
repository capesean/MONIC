import { Component as NgComponent, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmModalComponent, ConfirmModalOptions } from '../../common/components/confirm.component';
import { PagingHeaders } from '../../common/models/http.model';
import { OptionList } from '../../common/models/optionlist.model';
import { FadeThenShrink } from '../../common/animations/fadethenshrink';
import { BreadcrumbService } from '../../common/services/breadcrumb.service';
import { ErrorService } from '../../common/services/error.service';
import { OptionListService } from '../../common/services/optionlist.service';
import { Option, OptionSearchOptions, OptionSearchResponse } from '../../common/models/option.model';
import { OptionService } from '../../common/services/option.service';
import { OptionSortComponent } from '../options/option.sort.component';

@NgComponent({
    selector: 'optionlist-edit',
    templateUrl: './optionlist.edit.component.html',
    animations: [FadeThenShrink],
    standalone: false
})
export class OptionListEditComponent implements OnInit, OnDestroy {

    public optionList: OptionList = new OptionList();
    public isNew = true;
    private routerSubscription: Subscription;

    public optionsSearchOptions = new OptionSearchOptions();
    public optionsHeaders = new PagingHeaders();
    public options: Option[] = [];
    public showOptionsSearch = false;

    constructor(
        private router: Router,
        public route: ActivatedRoute,
        private toastr: ToastrService,
        private breadcrumbService: BreadcrumbService,
        private modalService: NgbModal,
        private optionListService: OptionListService,
        private optionService: OptionService,
        private errorService: ErrorService
    ) {
    }

    ngOnInit(): void {

        this.route.params.subscribe(params => {

            const optionListId = params["optionListId"];
            this.isNew = optionListId === "add";

            if (!this.isNew) {

                this.optionList.optionListId = optionListId;
                this.loadOptionList();

                this.optionsSearchOptions.optionListId = optionListId;
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

    private loadOptionList(): void {

        this.optionListService.get(this.optionList.optionListId)
            .subscribe({
                next: optionList => {
                    this.optionList = optionList;
                    this.changeBreadcrumb();
                },
                error: err => {
                    this.errorService.handleError(err, "Option List", "Load");
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

        this.optionListService.save(this.optionList)
            .subscribe({
                next: optionList => {
                    this.toastr.success("The option list has been saved", "Save Option List");
                    if (this.isNew) {
                        this.ngOnDestroy();
                        this.router.navigate(["../", optionList.optionListId], { relativeTo: this.route });
                    }
                },
                error: err => {
                    this.errorService.handleError(err, "Option List", "Save");
                }
            });

    }

    delete(): void {

        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Option List", text: "Are you sure you want to delete this option list?", deleteStyle: true, ok: "Delete" } as ConfirmModalOptions;
        modalRef.result.then(
            () => {

                this.optionListService.delete(this.optionList.optionListId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The option list has been deleted", "Delete Option List");
                            this.router.navigate(["../"], { relativeTo: this.route });
                        },
                        error: err => {
                            this.errorService.handleError(err, "Option List", "Delete");
                        }
                    });

            }, () => { });
    }

    changeBreadcrumb(): void {
        this.breadcrumbService.changeBreadcrumb(this.route.snapshot, this.optionList.name !== undefined ? this.optionList.name.substring(0, 25) : "(new option list)");
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

    showOptionSort(): void {
        let modalRef = this.modalService.open(OptionSortComponent, { size: 'xl', centered: true, scrollable: false });
        (modalRef.componentInstance as OptionSortComponent).optionListId = this.optionList.optionListId;
        modalRef.result.then(
            () => this.searchOptions(this.optionsHeaders.pageIndex),
            () => { }
        );
    }

}
