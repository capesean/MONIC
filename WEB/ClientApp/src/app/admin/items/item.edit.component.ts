import { Component as NgComponent, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmModalComponent, ConfirmModalOptions } from '../../common/components/confirm.component';
import { PagingHeaders } from '../../common/models/http.model';
import { Item } from '../../common/models/item.model';
import { Enum, Enums } from '../../common/models/enums.model';
import { FadeThenShrink } from '../../common/animations/fadethenshrink';
import { BreadcrumbService } from '../../common/services/breadcrumb.service';
import { ErrorService } from '../../common/services/error.service';
import { ItemService } from '../../common/services/item.service';
import { Document, DocumentSearchOptions, DocumentSearchResponse } from '../../common/models/document.model';
import { DocumentService } from '../../common/services/document.service';
import { OptionValue, OptionValueSearchOptions, OptionValueSearchResponse } from '../../common/models/optionvalue.model';
import { OptionValueService } from '../../common/services/optionvalue.service';

@NgComponent({
    selector: 'item-edit',
    templateUrl: './item.edit.component.html',
    animations: [FadeThenShrink]
})
export class ItemEditComponent implements OnInit, OnDestroy {

    public item: Item = new Item();
    public isNew = true;
    private routerSubscription: Subscription;
    public itemTypes: Enum[] = Enums.ItemTypes;

    public optionValuesSearchOptions = new OptionValueSearchOptions();
    public optionValuesHeaders = new PagingHeaders();
    public optionValues: OptionValue[] = [];
    public showOptionValuesSearch = false;

    public documentsSearchOptions = new DocumentSearchOptions();
    public documentsHeaders = new PagingHeaders();
    public documents: Document[] = [];
    public showDocumentsSearch = false;

    constructor(
        private router: Router,
        public route: ActivatedRoute,
        private toastr: ToastrService,
        private breadcrumbService: BreadcrumbService,
        private modalService: NgbModal,
        private itemService: ItemService,
        private documentService: DocumentService,
        private optionValueService: OptionValueService,
        private errorService: ErrorService
    ) {
    }

    ngOnInit(): void {

        this.route.params.subscribe(params => {

            const itemId = params["itemId"];
            this.isNew = itemId === "add";

            if (!this.isNew) {

                this.item.itemId = itemId;
                this.loadItem();

                this.optionValuesSearchOptions.itemId = itemId;
                this.optionValuesSearchOptions.includeParents = true;
                this.searchOptionValues();

                this.documentsSearchOptions.itemId = itemId;
                this.documentsSearchOptions.includeParents = true;
                this.searchDocuments();

            }

            this.routerSubscription = this.router.events.subscribe(event => {
                if (event instanceof NavigationEnd && !this.route.firstChild) {
                    // this will double-load on new save, as params change (above) + nav ends
                    this.searchDocuments();
                }
            });

        });

    }

    ngOnDestroy(): void {
        this.routerSubscription.unsubscribe();
    }

    private loadItem(): void {

        this.itemService.get(this.item.itemId)
            .subscribe({
                next: item => {
                    this.item = item;
                    this.changeBreadcrumb();
                },
                error: err => {
                    this.errorService.handleError(err, "Item", "Load");
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

        this.itemService.save(this.item)
            .subscribe({
                next: item => {
                    this.toastr.success("The item has been saved", "Save Item");
                    if (this.isNew) {
                        this.ngOnDestroy();
                        this.router.navigate(["../", item.itemId], { relativeTo: this.route });
                    }
                },
                error: err => {
                    this.errorService.handleError(err, "Item", "Save");
                }
            });

    }

    delete(): void {

        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Item", text: "Are you sure you want to delete this item?", deleteStyle: true, ok: "Delete" } as ConfirmModalOptions;
        modalRef.result.then(
            () => {

                this.itemService.delete(this.item.itemId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The item has been deleted", "Delete Item");
                            this.router.navigate(["../"], { relativeTo: this.route });
                        },
                        error: err => {
                            this.errorService.handleError(err, "Item", "Delete");
                        }
                    });

            }, () => { });
    }

    changeBreadcrumb(): void {
        this.breadcrumbService.changeBreadcrumb(this.route.snapshot, this.item.itemId !== undefined ? this.item.itemId.substring(0, 25) : "(new item)");
    }

    searchOptionValues(pageIndex = 0): Subject<OptionValueSearchResponse> {

        this.optionValuesSearchOptions.pageIndex = pageIndex;

        const subject = new Subject<OptionValueSearchResponse>()

        this.optionValueService.search(this.optionValuesSearchOptions)
            .subscribe({
                next: response => {
                    subject.next(response);
                    this.optionValues = response.optionValues;
                    this.optionValuesHeaders = response.headers;
                },
                error: err => {
                    this.errorService.handleError(err, "Option Values", "Load");
                }
            });

        return subject;

    }

    goToOptionValue(optionValue: OptionValue): void {
        this.router.navigate(["/optionvalues", optionValue.itemId, optionValue.optionId]);
    }

    deleteOptionValue(optionValue: OptionValue, event: MouseEvent): void {
        event.stopPropagation();

        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Option Value", text: "Are you sure you want to delete this option value?", deleteStyle: true, ok: "Delete" } as ConfirmModalOptions;
        modalRef.result.then(
            () => {

                this.optionValueService.delete(optionValue.itemId, optionValue.optionId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The option value has been deleted", "Delete Option Value");
                            this.searchOptionValues(this.optionValuesHeaders.pageIndex);
                        },
                        error: err => {
                            this.errorService.handleError(err, "Option Value", "Delete");
                        }
                    });

            }, () => { });
    }

    deleteOptionValues(): void {
        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Option Values", text: "Are you sure you want to delete all the option values?", deleteStyle: true, ok: "Delete" } as ConfirmModalOptions;
        modalRef.result.then(
            () => {

                this.itemService.deleteOptionValues(this.item.itemId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The option values have been deleted", "Delete Option Values");
                            this.searchOptionValues();
                        },
                        error: err => {
                            this.errorService.handleError(err, "Option Values", "Delete");
                        }
                    });
            }, () => { });

    }

    searchDocuments(pageIndex = 0): Subject<DocumentSearchResponse> {

        this.documentsSearchOptions.pageIndex = pageIndex;

        const subject = new Subject<DocumentSearchResponse>()

        this.documentService.search(this.documentsSearchOptions)
            .subscribe({
                next: response => {
                    subject.next(response);
                    this.documents = response.documents;
                    this.documentsHeaders = response.headers;
                },
                error: err => {
                    this.errorService.handleError(err, "Documents", "Load");
                }
            });

        return subject;

    }

    goToDocument(document: Document): void {
        this.router.navigate(["documents", document.documentId], { relativeTo: this.route });
    }

    deleteDocument(document: Document, event: MouseEvent): void {
        event.stopPropagation();

        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Document", text: "Are you sure you want to delete this document?", deleteStyle: true, ok: "Delete" } as ConfirmModalOptions;
        modalRef.result.then(
            () => {

                this.documentService.delete(document.documentId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The document has been deleted", "Delete Document");
                            this.searchDocuments(this.documentsHeaders.pageIndex);
                        },
                        error: err => {
                            this.errorService.handleError(err, "Document", "Delete");
                        }
                    });

            }, () => { });
    }

    deleteDocuments(): void {
        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Documents", text: "Are you sure you want to delete all the documents?", deleteStyle: true, ok: "Delete" } as ConfirmModalOptions;
        modalRef.result.then(
            () => {

                this.itemService.deleteDocuments(this.item.itemId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The documents have been deleted", "Delete Documents");
                            this.searchDocuments();
                        },
                        error: err => {
                            this.errorService.handleError(err, "Documents", "Delete");
                        }
                    });
            }, () => { });

    }

}
