import { Component, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Document } from '../../common/models/document.model';
import { DocumentService } from '../../common/services/document.service';
import { ErrorService } from '../../common/services/error.service';
import { Item } from '../../common/models/item.model';
import { NgForm } from '@angular/forms';
import { DownloadService } from '../../common/services/download.service';
import { ToastrService } from 'ngx-toastr';
import { ConfirmModalComponent, ConfirmModalOptions } from '../../common/components/confirm.component';

@Component({
    selector: 'document-manage',
    templateUrl: './document.manage.component.html',
    standalone: false
})
export class DocumentManageComponent implements OnInit {

    public document: Document = new Document();
    public isNew = true;
    //private item: Item;

    constructor(
        private modalService: NgbModal,
        private documentService: DocumentService,
        private errorService: ErrorService,
        public modal: NgbActiveModal,
        private downloadService: DownloadService,
        private toastr: ToastrService
    ) {
    }

    ngOnInit(): void {
    }

    public setItem(item: Item) {
        //this.item = item;
        this.document.itemId = item.itemId;
    }

    public setDocument(document: Document) {
        this.isNew = false;
        this.document = { ...document };
    }

    download(fileId: string): void {
        this.downloadService.downloadDocument(fileId).subscribe();
    }

    saveDocument(form: NgForm): void {

        if (form.invalid) {

            this.toastr.error("The form has not been completed correctly.", "Form Error");
            return;

        }

        this.documentService.save(this.document)
            .subscribe({
                next: document => {
                    this.toastr.success("The document has been saved", "Save Document");
                    this.modal.close(document);
                },
                error: err => {
                    this.errorService.handleError(err, "Document", "Save");
                }
            });

    }

    public deleteDocument(): void {
        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Document", text: "Are you sure you want to delete this document?", deleteStyle: true, ok: "Delete" } as ConfirmModalOptions;
        modalRef.result.then(
            () => {

                this.documentService.delete(this.document.documentId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The document has been deleted", "Delete Document");
                            this.modal.close(undefined);
                        },
                        error: err => {
                            this.errorService.handleError(err, "Document", "Delete");
                        }
                    });

            }, () => { });
    }


}
