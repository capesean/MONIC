import { Component as NgComponent, OnInit, ViewChild, Output, EventEmitter, TemplateRef, Input } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { FolderSearchOptions, FolderSearchResponse, Folder } from '../../common/models/folder.model';
import { FolderService } from '../../common/services/folder.service';
import { PagingHeaders } from '../../common/models/http.model';
import { ErrorService } from '../../common/services/error.service';

@NgComponent({
    selector: 'folder-modal',
    templateUrl: './folder.modal.component.html'
})
export class FolderModalComponent implements OnInit {

    public modal: NgbModalRef;
    public selectedItems: Folder[] = [];
    public headers: PagingHeaders = new PagingHeaders();
    public searchOptions: FolderSearchOptions = new FolderSearchOptions();
    public folders: Folder[];
    public allSelected = false;

    @ViewChild('content') content: TemplateRef<unknown>;
    @Output() change: EventEmitter<Folder> = new EventEmitter<Folder>();
    @Output() changes: EventEmitter<Folder[]> = new EventEmitter<Folder[]>();
    @Input() canRemoveFilters = false;
    @Input() multiple = false;
    @Input() showAddNew = false;
    @Input() showFilters = true;
    @Input() showFooter = true;
    @Input() resetOnOpen = false;
    @Input() title = this.multiple ? "Select folders" : "Select a folder";
    @Input() parentFolder: Folder;

    constructor(
        private modalService: NgbModal,
        private folderService: FolderService,
        private errorService: ErrorService
    ) {
    }

    ngOnInit(): void {
        this.searchOptions.includeParents = true;
    }

    open(): NgbModalRef {
        if (this.resetOnOpen) this.selectedItems = [];
        this.searchOptions.parentFolderId = this.parentFolder?.folderId;
        this.modal = this.modalService.open(this.content, { size: 'xl', centered: true, scrollable: false });
        this.runSearch();
        this.modal.result.then((folder: Folder | Folder[]) => {
            if (this.multiple) this.changes.emit(folder as Folder[]);
            else this.change.emit(folder as Folder);
        }, () => {
            // dismissed
        });
        return this.modal;
    }

    public runSearch(pageIndex = 0): Observable<FolderSearchResponse> {

        this.searchOptions.pageIndex = pageIndex;
        this.allSelected = false;

        const observable = this.folderService
            .search(this.searchOptions);

        observable.subscribe({
            next: response => {
                this.folders = response.folders;
                this.headers = response.headers;
            },
            error: err => {

                this.errorService.handleError(err, "Folders", "Load");

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

    select(folder: Folder) {
        if (this.multiple) {
            if (this.isSelected(folder)) {
                for (let i = 0; i < this.selectedItems.length; i++) {
                    if (this.selectedItems[i].folderId === folder.folderId) {
                        this.selectedItems.splice(i, 1);
                        break;
                    }
                }
            } else {
                this.selectedItems.push(folder);
            }
        } else {
            this.modal.close(folder);
        }
    }

    isSelected(folder: Folder) {
        if (!this.multiple) return false;
        return this.selectedItems.filter(item => item.folderId === folder.folderId).length > 0;
    }

    toggleAll() {
        this.allSelected = !this.allSelected;
        this.folders.forEach(folder => {
            const isSelected = this.isSelected(folder);
			if (isSelected && !this.allSelected) {
                for (let i = 0; i < this.selectedItems.length; i++) {
                    if (this.selectedItems[i].folderId === folder.folderId) {
                        this.selectedItems.splice(i, 1);
                        break;
                    }
                }
            } else if (!isSelected && this.allSelected) {
                this.selectedItems.push(folder);
            }
        });
    }

    selectAll() {

        const oldPageSize = this.searchOptions.pageSize;
        this.searchOptions.pageSize = 0;
        this.searchOptions.pageIndex = 0;

        this.folderService.search(this.searchOptions)
            .subscribe({
                next: response => {
                    this.modal.close(response.folders);
                    this.folders = response.folders;
                    this.searchOptions.pageSize = oldPageSize;
                },
                error: err => {
                    this.errorService.handleError(err, "Folders", "Load");
                }
            });

    }

    addNew() {
        window.open("/folders/add", "_blank");
    }
}
