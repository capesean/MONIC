import { Component as NgComponent, OnInit, ViewChild, Output, EventEmitter, TemplateRef, Input } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { FolderContentSearchOptions, FolderContentSearchResponse, FolderContent } from '../../common/models/foldercontent.model';
import { FolderContentService } from '../../common/services/foldercontent.service';
import { PagingHeaders } from '../../common/models/http.model';
import { ErrorService } from '../../common/services/error.service';
import { Folder } from '../../common/models/folder.model';
import { User } from '../../common/models/user.model';

@NgComponent({
    selector: 'folder-content-modal',
    templateUrl: './foldercontent.modal.component.html',
    standalone: false
})
export class FolderContentModalComponent implements OnInit {

    public modal: NgbModalRef;
    public selectedItems: FolderContent[] = [];
    public headers: PagingHeaders = new PagingHeaders();
    public searchOptions: FolderContentSearchOptions = new FolderContentSearchOptions();
    public folderContents: FolderContent[];
    public allSelected = false;

    @ViewChild('content') content: TemplateRef<unknown>;
    @Output() change: EventEmitter<FolderContent> = new EventEmitter<FolderContent>();
    @Output() changes: EventEmitter<FolderContent[]> = new EventEmitter<FolderContent[]>();
    @Input() canRemoveFilters = false;
    @Input() multiple = false;
    @Input() showAddNew = false;
    @Input() showFilters = true;
    @Input() showFooter = true;
    @Input() resetOnOpen = false;
    @Input() title = this.multiple ? "Select folder contents" : "Select a folder content";
    @Input() folder: Folder;
    @Input() addedBy: User;

    constructor(
        private modalService: NgbModal,
        private folderContentService: FolderContentService,
        private errorService: ErrorService
    ) {
    }

    ngOnInit(): void {
        this.searchOptions.includeParents = true;
    }

    open(): NgbModalRef {
        if (this.resetOnOpen) this.selectedItems = [];
        this.searchOptions.folderId = this.folder?.folderId;
        this.searchOptions.addedById = this.addedBy?.id;
        this.modal = this.modalService.open(this.content, { size: 'xl', centered: true, scrollable: false });
        this.runSearch();
        this.modal.result.then((folderContent: FolderContent | FolderContent[]) => {
            if (this.multiple) this.changes.emit(folderContent as FolderContent[]);
            else this.change.emit(folderContent as FolderContent);
        }, () => {
            // dismissed
        });
        return this.modal;
    }

    public runSearch(pageIndex = 0): Observable<FolderContentSearchResponse> {

        this.searchOptions.pageIndex = pageIndex;
        this.allSelected = false;

        const observable = this.folderContentService
            .search(this.searchOptions);

        observable.subscribe({
            next: response => {
                this.folderContents = response.folderContents;
                this.headers = response.headers;
            },
            error: err => {

                this.errorService.handleError(err, "Folder Contents", "Load");

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

    select(folderContent: FolderContent) {
        if (this.multiple) {
            if (this.isSelected(folderContent)) {
                for (let i = 0; i < this.selectedItems.length; i++) {
                    if (this.selectedItems[i].folderContentId === folderContent.folderContentId) {
                        this.selectedItems.splice(i, 1);
                        break;
                    }
                }
            } else {
                this.selectedItems.push(folderContent);
            }
        } else {
            this.modal.close(folderContent);
        }
    }

    isSelected(folderContent: FolderContent) {
        if (!this.multiple) return false;
        return this.selectedItems.filter(item => item.folderContentId === folderContent.folderContentId).length > 0;
    }

    toggleAll() {
        this.allSelected = !this.allSelected;
        this.folderContents.forEach(folderContent => {
            const isSelected = this.isSelected(folderContent);
			if (isSelected && !this.allSelected) {
                for (let i = 0; i < this.selectedItems.length; i++) {
                    if (this.selectedItems[i].folderContentId === folderContent.folderContentId) {
                        this.selectedItems.splice(i, 1);
                        break;
                    }
                }
            } else if (!isSelected && this.allSelected) {
                this.selectedItems.push(folderContent);
            }
        });
    }

    selectAll() {

        const oldPageSize = this.searchOptions.pageSize;
        this.searchOptions.pageSize = 0;
        this.searchOptions.pageIndex = 0;

        this.folderContentService.search(this.searchOptions)
            .subscribe({
                next: response => {
                    this.modal.close(response.folderContents);
                    this.folderContents = response.folderContents;
                    this.searchOptions.pageSize = oldPageSize;
                },
                error: err => {
                    this.errorService.handleError(err, "Folder Contents", "Load");
                }
            });

    }

    addNew() {
        window.open("/foldercontents/add", "_blank");
    }
}
