import { Component as NgComponent, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmModalComponent, ConfirmModalOptions } from '../../common/components/confirm.component';
import { PagingHeaders } from '../../common/models/http.model';
import { Category } from '../../common/models/category.model';
import { FadeThenShrink } from '../../common/animations/fadethenshrink';
import { BreadcrumbService } from '../../common/services/breadcrumb.service';
import { ErrorService } from '../../common/services/error.service';
import { CategoryService } from '../../common/services/category.service';
import { Subcategory, SubcategorySearchOptions, SubcategorySearchResponse } from '../../common/models/subcategory.model';
import { SubcategoryService } from '../../common/services/subcategory.service';
import { SubcategorySortComponent } from '../subcategories/subcategory.sort.component';
import { AppService } from '../../common/services/app.service';
import { ItemComponent } from '../../common/components/item.component';
import { DocumentService } from '../../common/services/document.service';
import { FieldValueMapperService } from '../../common/services/field-value-mapper.service';
import { Item } from '../../common/models/item.model';
import { ItemTypes } from '../../common/models/enums.model';

@NgComponent({
    selector: 'category-edit',
    templateUrl: './category.edit.component.html',
    animations: [FadeThenShrink],
    standalone: false
})
export class CategoryEditComponent extends ItemComponent implements OnInit, OnDestroy {

    public category: Category = new Category();
    public isNew = true;
    private routerSubscription: Subscription;

    public subcategoriesSearchOptions = new SubcategorySearchOptions();
    public subcategoriesHeaders = new PagingHeaders();
    public subcategories: Subcategory[] = [];
    public showSubcategoriesSearch = false;

    constructor(
        private router: Router,
        public route: ActivatedRoute,
        private toastr: ToastrService,
        private breadcrumbService: BreadcrumbService,
        protected modalService: NgbModal,
        private categoryService: CategoryService,
        private subcategoryService: SubcategoryService,
        protected cdref: ChangeDetectorRef,
        protected appService: AppService,
        protected documentService: DocumentService,
        protected fieldValueMapper: FieldValueMapperService,
        protected errorService: ErrorService
    ) {
        super(appService, errorService, cdref, documentService, modalService, fieldValueMapper);
    }

    ngOnInit(): void {

        this.route.params.subscribe(params => {

            const categoryId = params["categoryId"];
            this.isNew = categoryId === "add";

            if (this.isNew) {
                this.setItem(this.category, {
                    itemType: ItemTypes.Category,
                    itemId: this.category.categoryId
                } as Item);
            } else {

                this.category.categoryId = categoryId;
                this.loadCategory();

                this.subcategoriesSearchOptions.categoryId = categoryId;
                this.subcategoriesSearchOptions.includeParents = true;
                this.searchSubcategories();

            }

            this.routerSubscription = this.router.events.subscribe(event => {
                if (event instanceof NavigationEnd && !this.route.firstChild) {
                    // this will double-load on new save, as params change (above) + nav ends
                    this.searchSubcategories();
                }
            });

        });

    }

    ngOnDestroy(): void {
        this.routerSubscription.unsubscribe();
    }

    private loadCategory(): void {

        this.categoryService.get(this.category.categoryId)
            .subscribe({
                next: category => {
                    this.category = category;
                    this.changeBreadcrumb();
                    this.setItem(this.category, {
                        itemType: ItemTypes.Category,
                        itemId: this.category.categoryId
                    } as Item);
                    this.searchDocuments();
                },
                error: err => {
                    this.errorService.handleError(err, "Category", "Load");
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

        this.categoryService.save(this.category)
            .subscribe({
                next: category => {
                    this.toastr.success("The category has been saved", "Save Category");
                    if (this.isNew) {
                        this.ngOnDestroy();
                        this.router.navigate(["../", category.categoryId], { relativeTo: this.route });
                    } else {
                        this.category = category;
                        this.setItem(this.category, {
                            itemType: ItemTypes.Category,
                            itemId: this.category.categoryId
                        } as Item);
                    }
                },
                error: err => {
                    this.errorService.handleError(err, "Category", "Save");
                }
            });

    }

    delete(): void {

        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Category", text: "Are you sure you want to delete this category?", deleteStyle: true, ok: "Delete" } as ConfirmModalOptions;
        modalRef.result.then(
            () => {

                this.categoryService.delete(this.category.categoryId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The category has been deleted", "Delete Category");
                            this.router.navigate(["../"], { relativeTo: this.route });
                        },
                        error: err => {
                            this.errorService.handleError(err, "Category", "Delete");
                        }
                    });

            }, () => { });
    }

    changeBreadcrumb(): void {
        this.breadcrumbService.changeBreadcrumb(this.route.snapshot, this.category.name !== undefined ? this.category.name.substring(0, 25) : "(new category)");
    }

    searchSubcategories(pageIndex = 0): Subject<SubcategorySearchResponse> {

        this.subcategoriesSearchOptions.pageIndex = pageIndex;

        const subject = new Subject<SubcategorySearchResponse>()

        this.subcategoryService.search(this.subcategoriesSearchOptions)
            .subscribe({
                next: response => {
                    subject.next(response);
                    this.subcategories = response.subcategories;
                    this.subcategoriesHeaders = response.headers;
                },
                error: err => {
                    this.errorService.handleError(err, "Subcategories", "Load");
                }
            });

        return subject;

    }

    goToSubcategory(subcategory: Subcategory): void {
        this.router.navigate(["subcategories", subcategory.subcategoryId], { relativeTo: this.route });
    }

    deleteSubcategory(subcategory: Subcategory, event: MouseEvent): void {
        event.stopPropagation();

        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Subcategory", text: "Are you sure you want to delete this subcategory?", deleteStyle: true, ok: "Delete" } as ConfirmModalOptions;
        modalRef.result.then(
            () => {

                this.subcategoryService.delete(subcategory.subcategoryId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The subcategory has been deleted", "Delete Subcategory");
                            this.searchSubcategories(this.subcategoriesHeaders.pageIndex);
                        },
                        error: err => {
                            this.errorService.handleError(err, "Subcategory", "Delete");
                        }
                    });

            }, () => { });
    }

    deleteSubcategories(): void {
        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Subcategories", text: "Are you sure you want to delete all the subcategories?", deleteStyle: true, ok: "Delete" } as ConfirmModalOptions;
        modalRef.result.then(
            () => {

                this.categoryService.deleteSubcategories(this.category.categoryId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The subcategories have been deleted", "Delete Subcategories");
                            this.searchSubcategories();
                        },
                        error: err => {
                            this.errorService.handleError(err, "Subcategories", "Delete");
                        }
                    });
            }, () => { });

    }

    showSubcategorySort(): void {
        let modalRef = this.modalService.open(SubcategorySortComponent, { size: 'xl', centered: true, scrollable: false });
        (modalRef.componentInstance as SubcategorySortComponent).categoryId = this.category.categoryId;
        modalRef.result.then(
            () => this.searchSubcategories(this.subcategoriesHeaders.pageIndex),
            () => { }
        );
    }

}
