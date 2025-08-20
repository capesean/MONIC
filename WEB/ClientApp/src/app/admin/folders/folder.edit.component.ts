import { Component as NgComponent, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmModalComponent, ConfirmModalOptions } from '../../common/components/confirm.component';
import { PagingHeaders } from '../../common/models/http.model';
import { Folder } from '../../common/models/folder.model';
import { FadeThenShrink } from '../../common/animations/fadethenshrink';
import { BreadcrumbService } from '../../common/services/breadcrumb.service';
import { ErrorService } from '../../common/services/error.service';
import { FolderService } from '../../common/services/folder.service';
import { FolderSearchOptions, FolderSearchResponse } from '../../common/models/folder.model';
import { FolderContent, FolderContentSearchOptions, FolderContentSearchResponse } from '../../common/models/foldercontent.model';
import { FolderContentService } from '../../common/services/foldercontent.service';
import { ItemComponent } from '../../common/components/item.component';
import { AppService } from '../../common/services/app.service';
import { DocumentService } from '../../common/services/document.service';
import { ItemTypes } from '../../common/models/enums.model';
import { Item } from '../../common/models/item.model';
import { FieldValueMapperService } from '../../common/services/field-value-mapper.service';

@NgComponent({
    selector: 'folder-edit',
    templateUrl: './folder.edit.component.html',
    animations: [FadeThenShrink],
    standalone: false
})
export class FolderEditComponent extends ItemComponent implements OnInit, OnDestroy {

    public folder: Folder = new Folder();
    public isNew = true;
    private routerSubscription: Subscription;

    public subfoldersSearchOptions = new FolderSearchOptions();
    public subfoldersHeaders = new PagingHeaders();
    public subfolders: Folder[] = [];
    public showSubfoldersSearch = false;

    public folderContentsSearchOptions = new FolderContentSearchOptions();
    public folderContentsHeaders = new PagingHeaders();
    public folderContents: FolderContent[] = [];
    public showFolderContentsSearch = false;

    constructor(
        private router: Router,
        public route: ActivatedRoute,
        private toastr: ToastrService,
        private breadcrumbService: BreadcrumbService,
        protected modalService: NgbModal,
        private folderService: FolderService,
        private folderContentService: FolderContentService,
        protected errorService: ErrorService,
        protected cdref: ChangeDetectorRef,
        protected appService: AppService,
        protected documentService: DocumentService,
        protected fieldValueMapper: FieldValueMapperService
    ) {
        super(appService, errorService, cdref, documentService, modalService, fieldValueMapper);
    }

    ngOnInit(): void {

        this.route.params.subscribe(params => {

            const folderId = params["folderId"];
            this.isNew = folderId === "add";

            if (!this.isNew) {

                this.folder.folderId = folderId;
                this.loadFolder();

                this.subfoldersSearchOptions.parentFolderId = folderId;
                this.subfoldersSearchOptions.includeParents = true;
                this.searchSubfolders();

                this.folderContentsSearchOptions.folderId = folderId;
                this.folderContentsSearchOptions.includeParents = true;
                this.searchFolderContents();

            }
            else {
                this.setItem(this.folder, { itemType: ItemTypes.Folder, itemId: this.folder.folderId } as Item);
            }

            this.routerSubscription = this.router.events.subscribe(event => {
                if (event instanceof NavigationEnd && !this.route.firstChild) {
                    // this will double-load on new save, as params change (above) + nav ends
                    this.searchFolderContents();
                }
            });

        });

    }

    ngOnDestroy(): void {
        this.routerSubscription.unsubscribe();
    }

    private loadFolder(): void {

        this.folderService.get(this.folder.folderId)
            .subscribe({
                next: folder => {
                    this.folder = folder;
                    this.changeBreadcrumb();
                    this.setItem(this.folder, { itemType: ItemTypes.Folder, itemId: this.folder.folderId } as Item);
                    this.searchDocuments();
                },
                error: err => {
                    this.errorService.handleError(err, "Folder", "Load");
                    if (err instanceof HttpErrorResponse && err.status === 404)
                        this.router.navigate(["../"], { relativeTo: this.route });
                }
            });

    }

    save(form: NgForm): void {

        this.updateValueAndValidity(form);

        if (form.invalid) {

            this.toastr.error("The form has not been completed correctly.", "Form Error");
            return;

        }

        this.getData(this.folder);

        this.folderService.save(this.folder)
            .subscribe({
                next: folder => {
                    this.toastr.success("The folder has been saved", "Save Folder");
                    if (this.isNew) {
                        this.ngOnDestroy();
                        this.router.navigate(["../", folder.folderId], { relativeTo: this.route });
                    }
                    else {
                        this.folder = folder;
                        this.setItem(this.folder, { itemType: ItemTypes.Folder, itemId: this.folder.folderId } as Item);
                    }
                },
                error: err => {
                    this.errorService.handleError(err, "Folder", "Save");
                }
            });

    }

    delete(): void {

        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Folder", text: "Are you sure you want to delete this folder?", deleteStyle: true, ok: "Delete" } as ConfirmModalOptions;
        modalRef.result.then(
            () => {

                this.folderService.delete(this.folder.folderId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The folder has been deleted", "Delete Folder");
                            this.router.navigate(["../"], { relativeTo: this.route });
                        },
                        error: err => {
                            this.errorService.handleError(err, "Folder", "Delete");
                        }
                    });

            }, () => { });
    }

    changeBreadcrumb(): void {
        this.breadcrumbService.changeBreadcrumb(this.route.snapshot, this.folder.name !== undefined ? this.folder.name.substring(0, 25) : "(new folder)");
    }

    searchSubfolders(pageIndex = 0): Subject<FolderSearchResponse> {

        this.subfoldersSearchOptions.pageIndex = pageIndex;

        const subject = new Subject<FolderSearchResponse>()

        this.folderService.search(this.subfoldersSearchOptions)
            .subscribe({
                next: response => {
                    subject.next(response);
                    this.subfolders = response.folders;
                    this.subfoldersHeaders = response.headers;
                },
                error: err => {
                    this.errorService.handleError(err, "Subfolders", "Load");
                }
            });

        return subject;

    }

    goToSubfolder(folder: Folder): void {
        this.router.navigate(['../', folder.folderId], { relativeTo: this.route });
    }

    deleteSubfolder(folder: Folder, event: MouseEvent): void {
        event.stopPropagation();

        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Folder", text: "Are you sure you want to delete this folder?", deleteStyle: true, ok: "Delete" } as ConfirmModalOptions;
        modalRef.result.then(
            () => {

                this.folderService.delete(folder.folderId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The folder has been deleted", "Delete Folder");
                            this.searchSubfolders(this.subfoldersHeaders.pageIndex);
                        },
                        error: err => {
                            this.errorService.handleError(err, "Folder", "Delete");
                        }
                    });

            }, () => { });
    }

    deleteSubfolders(): void {
        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Subfolders", text: "Are you sure you want to delete all the subfolders?", deleteStyle: true, ok: "Delete" } as ConfirmModalOptions;
        modalRef.result.then(
            () => {

                this.folderService.deleteSubfolders(this.folder.folderId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The subfolders have been deleted", "Delete Subfolders");
                            this.searchSubfolders();
                        },
                        error: err => {
                            this.errorService.handleError(err, "Subfolders", "Delete");
                        }
                    });
            }, () => { });

    }

    searchFolderContents(pageIndex = 0): Subject<FolderContentSearchResponse> {

        this.folderContentsSearchOptions.pageIndex = pageIndex;

        const subject = new Subject<FolderContentSearchResponse>()

        this.folderContentService.search(this.folderContentsSearchOptions)
            .subscribe({
                next: response => {
                    subject.next(response);
                    this.folderContents = response.folderContents;
                    this.folderContentsHeaders = response.headers;
                },
                error: err => {
                    this.errorService.handleError(err, "Folder Contents", "Load");
                }
            });

        return subject;

    }

    goToFolderContent(folderContent: FolderContent): void {
        this.router.navigate(["foldercontents", folderContent.folderContentId], { relativeTo: this.route });
    }

    deleteFolderContent(folderContent: FolderContent, event: MouseEvent): void {
        event.stopPropagation();

        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Folder Content", text: "Are you sure you want to delete this folder content?", deleteStyle: true, ok: "Delete" } as ConfirmModalOptions;
        modalRef.result.then(
            () => {

                this.folderContentService.delete(folderContent.folderContentId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The folder content has been deleted", "Delete Folder Content");
                            this.searchFolderContents(this.folderContentsHeaders.pageIndex);
                        },
                        error: err => {
                            this.errorService.handleError(err, "Folder Content", "Delete");
                        }
                    });

            }, () => { });
    }

    deleteFolderContents(): void {
        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Folder Contents", text: "Are you sure you want to delete all the folder contents?", deleteStyle: true, ok: "Delete" } as ConfirmModalOptions;
        modalRef.result.then(
            () => {

                this.folderService.deleteFolderContents(this.folder.folderId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The folder contents have been deleted", "Delete Folder Contents");
                            this.searchFolderContents();
                        },
                        error: err => {
                            this.errorService.handleError(err, "Folder Contents", "Delete");
                        }
                    });
            }, () => { });

    }

}
