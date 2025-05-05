import { Component as NgComponent, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmModalComponent, ConfirmModalOptions } from '../../common/components/confirm.component';
import { FolderContent } from '../../common/models/foldercontent.model';
import { BreadcrumbService } from '../../common/services/breadcrumb.service';
import { ErrorService } from '../../common/services/error.service';
import { FolderContentService } from '../../common/services/foldercontent.service';

@NgComponent({
    selector: 'foldercontent-edit',
    templateUrl: './foldercontent.edit.component.html',
    standalone: false
})
export class FolderContentEditComponent implements OnInit {

    public folderContent: FolderContent = new FolderContent();
    public isNew = true;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private toastr: ToastrService,
        private breadcrumbService: BreadcrumbService,
        private modalService: NgbModal,
        private folderContentService: FolderContentService,
        private errorService: ErrorService
    ) {
    }

    ngOnInit(): void {

        this.route.params.subscribe(params => {

            const folderContentId = params["folderContentId"];
            this.folderContent.folderId = this.route.snapshot.parent.params.folderId;
            this.isNew = folderContentId === "add";

            if (!this.isNew) {

                this.folderContent.folderContentId = folderContentId;
                this.loadFolderContent();

            }

        });

    }

    private loadFolderContent(): void {

        this.folderContentService.get(this.folderContent.folderContentId)
            .subscribe({
                next: folderContent => {
                    this.folderContent = folderContent;
                    this.changeBreadcrumb();
                },
                error: err => {
                    this.errorService.handleError(err, "Folder Content", "Load");
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

        this.folderContentService.save(this.folderContent)
            .subscribe({
                next: folderContent => {
                    this.toastr.success("The folder content has been saved", "Save Folder Content");
                    if (this.isNew) this.router.navigate(["../", folderContent.folderContentId], { relativeTo: this.route });
                },
                error: err => {
                    this.errorService.handleError(err, "Folder Content", "Save");
                }
            });

    }

    delete(): void {

        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Folder Content", text: "Are you sure you want to delete this folder content?", deleteStyle: true, ok: "Delete" } as ConfirmModalOptions;
        modalRef.result.then(
            () => {

                this.folderContentService.delete(this.folderContent.folderContentId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The folder content has been deleted", "Delete Folder Content");
                            this.router.navigate(["../../"], { relativeTo: this.route });
                        },
                        error: err => {
                            this.errorService.handleError(err, "Folder Content", "Delete");
                        }
                    });

            }, () => { });
    }

    changeBreadcrumb(): void {
        this.breadcrumbService.changeBreadcrumb(this.route.snapshot, this.folderContent.name !== undefined ? this.folderContent.name.substring(0, 25) : "(new folder content)");
    }

}
