import { Component as NgComponent, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { BreadcrumbService } from '../../common/services/breadcrumb.service';
import { ErrorService } from '../../common/services/error.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmModalComponent, ConfirmModalOptions } from '../../common/components/confirm.component';
import { PagingHeaders } from '../../common/models/http.model';
import { Subcategory } from '../../common/models/subcategory.model';
import { SubcategoryService } from '../../common/services/subcategory.service';
import { Enum, Enums } from '../../common/models/enums.model';
import { FadeThenShrink } from '../../common/animations/fadethenshrink';
import { Indicator, IndicatorSearchOptions, IndicatorSearchResponse } from '../../common/models/indicator.model';
import { IndicatorService } from '../../common/services/indicator.service';
import { IndicatorSortComponent } from '../indicators/indicator.sort.component';
import { trigger, transition, style, animate } from '@angular/animations';

@NgComponent({
    selector: 'subcategory-edit',
    templateUrl: './subcategory.edit.component.html',
    animations: [FadeThenShrink]
})
export class SubcategoryEditComponent implements OnInit, OnDestroy {

    public subcategory: Subcategory = new Subcategory();
    public isNew = true;
    private routerSubscription: Subscription;
    public indicatorTypes: Enum[] = Enums.IndicatorTypes;
    public indicatorStatuses: Enum[] = Enums.IndicatorStatuses;
    public dateTypes: Enum[] = Enums.DateTypes;

    public indicatorsSearchOptions = new IndicatorSearchOptions();
    public indicatorsHeaders = new PagingHeaders();
    public indicators: Indicator[] = [];
    public showIndicatorsSearch = false;

    constructor(
        private router: Router,
        public route: ActivatedRoute,
        private toastr: ToastrService,
        private breadcrumbService: BreadcrumbService,
        private modalService: NgbModal,
        private subcategoryService: SubcategoryService,
        private indicatorService: IndicatorService,
        private errorService: ErrorService
    ) {
    }

    ngOnInit(): void {

        this.route.params.subscribe(params => {

            const subcategoryId = params["subcategoryId"];
            this.subcategory.categoryId = this.route.snapshot.parent.params.categoryId;
            this.isNew = subcategoryId === "add";

            if (!this.isNew) {

                this.subcategory.subcategoryId = subcategoryId;
                this.loadSubcategory();

                this.indicatorsSearchOptions.subcategoryId = subcategoryId;
                this.indicatorsSearchOptions.includeParents = true;
                this.searchIndicators();

            }

            this.routerSubscription = this.router.events.subscribe(event => {
                if (event instanceof NavigationEnd && !this.route.firstChild) {
                    // this will double-load on new save, as params change (above) + nav ends
                    this.searchIndicators();
                }
            });

        });

    }

    ngOnDestroy(): void {
        this.routerSubscription.unsubscribe();
    }

    private loadSubcategory(): void {

        this.subcategoryService.get(this.subcategory.subcategoryId)
            .subscribe({
                next: subcategory => {
                    this.subcategory = subcategory;
                    this.changeBreadcrumb();
                },
                error: err => {
                    this.errorService.handleError(err, "Subcategory", "Load");
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

        this.subcategoryService.save(this.subcategory)
            .subscribe({
                next: subcategory => {
                    this.toastr.success("The subcategory has been saved", "Save Subcategory");
                    if (this.isNew) {
                        this.ngOnDestroy();
                        this.router.navigate(["../", subcategory.subcategoryId], { relativeTo: this.route });
                    }
                },
                error: err => {
                    this.errorService.handleError(err, "Subcategory", "Save");
                }
            });

    }

    delete(): void {

        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Subcategory", text: "Are you sure you want to delete this subcategory?", deleteStyle: true, ok: "Delete" } as ConfirmModalOptions;
        modalRef.result.then(
            () => {

                this.subcategoryService.delete(this.subcategory.subcategoryId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The subcategory has been deleted", "Delete Subcategory");
                            this.router.navigate(["../../"], { relativeTo: this.route });
                        },
                        error: err => {
                            this.errorService.handleError(err, "Subcategory", "Delete");
                        }
                    });

        }, () => { });
    }

    changeBreadcrumb(): void {
        this.breadcrumbService.changeBreadcrumb(this.route.snapshot, this.subcategory.name !== undefined ? this.subcategory.name.substring(0, 25) : "(new subcategory)");
    }

    searchIndicators(pageIndex = 0): Subject<IndicatorSearchResponse> {

        this.indicatorsSearchOptions.pageIndex = pageIndex;

        const subject = new Subject<IndicatorSearchResponse>()

        this.indicatorService.search(this.indicatorsSearchOptions)
            .subscribe({
                next: response => {
                    subject.next(response);
                    this.indicators = response.indicators;
                    this.indicatorsHeaders = response.headers;
                },
                error: err => {
                    this.errorService.handleError(err, "Indicators", "Load");
                }
            });

        return subject;

    }

    goToIndicator(indicator: Indicator): void {
        this.router.navigate(["indicators", indicator.indicatorId]);
    }

    deleteIndicator(indicator: Indicator, event: MouseEvent): void {
        event.stopPropagation();

        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Indicator", text: "Are you sure you want to delete this indicator?", deleteStyle: true, ok: "Delete" } as ConfirmModalOptions;
        modalRef.result.then(
            () => {

                this.indicatorService.delete(indicator.indicatorId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The indicator has been deleted", "Delete Indicator");
                            this.searchIndicators(this.indicatorsHeaders.pageIndex);
                        },
                        error: err => {
                            this.errorService.handleError(err, "Indicator", "Delete");
                        }
                    });

            }, () => { });
    }

    deleteIndicators(): void {
        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Indicators", text: "Are you sure you want to delete all the indicators?", deleteStyle: true, ok: "Delete" } as ConfirmModalOptions;
        modalRef.result.then(
            () => {

                this.subcategoryService.deleteIndicators(this.subcategory.subcategoryId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The indicators have been deleted", "Delete Indicators");
                            this.searchIndicators();
                        },
                        error: err => {
                            this.errorService.handleError(err, "Indicators", "Delete");
                        }
                    });
            }, () => { });

    }

    showIndicatorSort() {
        let modalRef = this.modalService.open(IndicatorSortComponent, { size: 'xl', centered: true, scrollable: true });
        (modalRef.componentInstance as IndicatorSortComponent).subcategoryId = this.subcategory.subcategoryId;
        modalRef.result.then(
            () => this.searchIndicators(this.indicatorsHeaders.pageIndex),
            () => { }
        );
    }

}
