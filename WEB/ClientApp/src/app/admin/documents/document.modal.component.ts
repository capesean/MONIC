import { Component as NgComponent, OnInit, ViewChild, Output, EventEmitter, TemplateRef, Input } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { DocumentSearchOptions, DocumentSearchResponse, Document } from '../../common/models/document.model';
import { DocumentService } from '../../common/services/document.service';
import { PagingHeaders } from '../../common/models/http.model';
import { ErrorService } from '../../common/services/error.service';
import { Item } from '../../common/models/item.model';

@NgComponent({
    selector: 'document-modal',
    templateUrl: './document.modal.component.html'
})
export class DocumentModalComponent implements OnInit {

    public modal: NgbModalRef;
    public selectedItems: Document[] = [];
    public headers: PagingHeaders = new PagingHeaders();
    public searchOptions: DocumentSearchOptions = new DocumentSearchOptions();
    public documents: Document[];
    public allSelected = false;

    @ViewChild('content') content: TemplateRef<unknown>;
    @Output() change: EventEmitter<Document> = new EventEmitter<Document>();
    @Output() changes: EventEmitter<Document[]> = new EventEmitter<Document[]>();
    @Input() canRemoveFilters = false;
    @Input() multiple = false;
    @Input() showAddNew = false;
    @Input() showFooter = true;
    @Input() resetOnOpen = false;
    @Input() title = this.multiple ? "Select documents" : "Select a document";
    @Input() item: Item;

    constructor(
        private modalService: NgbModal,
        private documentService: DocumentService,
        private errorService: ErrorService
    ) {
    }

    ngOnInit(): void {
        this.searchOptions.includeParents = true;
    }

    open(): NgbModalRef {
        if (this.resetOnOpen) this.selectedItems = [];
        this.searchOptions.itemId = this.item?.itemId;
        this.modal = this.modalService.open(this.content, { size: 'xl', centered: true, scrollable: true });
        this.runSearch();
        this.modal.result.then((document: Document | Document[]) => {
            if (this.multiple) this.changes.emit(document as Document[]);
            else this.change.emit(document as Document);
        }, () => {
            // dismissed
        });
        return this.modal;
    }

    public runSearch(pageIndex = 0): Observable<DocumentSearchResponse> {

        this.searchOptions.pageIndex = pageIndex;
        this.allSelected = false;

        const observable = this.documentService
            .search(this.searchOptions);

        observable.subscribe({
            next: response => {
                this.documents = response.documents;
                this.headers = response.headers;
            },
            error: err => {

                this.errorService.handleError(err, "Documents", "Load");

            }
        });

        return observable;

    }

    close() {
        if (this.multiple) this.modal.close(this.selectedItems);
        else this.modal.dismiss();
    }

    clear() {
        if (this.multiple) { this.selectedItems = []; this.modal.close([]); }
        else this.modal.close(undefined);
    }

    select(document: Document) {
        if (this.multiple) {
            if (this.isSelected(document)) {
                for (let i = 0; i < this.selectedItems.length; i++) {
                    if (this.selectedItems[i].documentId === document.documentId) {
                        this.selectedItems.splice(i, 1);
                        break;
                    }
                }
            } else {
                this.selectedItems.push(document);
            }
        } else {
            this.modal.close(document);
        }
    }

    isSelected(document: Document) {
        if (!this.multiple) return false;
        return this.selectedItems.filter(item => item.documentId === document.documentId).length > 0;
    }

    toggleAll() {
        this.allSelected = !this.allSelected;
        this.documents.forEach(document => {
            const isSelected = this.isSelected(document);
			if (isSelected && !this.allSelected) {
                for (let i = 0; i < this.selectedItems.length; i++) {
                    if (this.selectedItems[i].documentId === document.documentId) {
                        this.selectedItems.splice(i, 1);
                        break;
                    }
                }
            } else if (!isSelected && this.allSelected) {
                this.selectedItems.push(document);
            }
        });
    }

    selectAll() {

        const oldPageSize = this.searchOptions.pageSize;
        this.searchOptions.pageSize = 0;
        this.searchOptions.pageIndex = 0;

        this.documentService.search(this.searchOptions)
            .subscribe({
                next: response => {
                    this.modal.close(response.documents);
                    this.documents = response.documents;
                    this.searchOptions.pageSize = oldPageSize;
                },
                error: err => {
                    this.errorService.handleError(err, "Documents", "Load");
                }
            });

    }

    addNew() {
        window.open("/documents/add", "_blank");
    }
}
