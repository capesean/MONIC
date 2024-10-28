import { Component as NgComponent, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { PagingHeaders } from '../../common/models/http.model';
import { DocumentSearchOptions, DocumentSearchResponse, Document } from '../../common/models/document.model';
import { FadeThenShrink } from '../../common/animations/fadethenshrink';
import { ErrorService } from '../../common/services/error.service';
import { DocumentService } from '../../common/services/document.service';
import { DownloadService } from '../../common/services/download.service';

@NgComponent({
    selector: 'document-list',
    templateUrl: './document.list.component.html',
    animations: [FadeThenShrink]
})
export class DocumentListComponent implements OnInit {

    public documents: Document[] = [];
    public searchOptions = new DocumentSearchOptions();
    public showSearchOptions = false;
    public headers = new PagingHeaders();

    constructor(
        public route: ActivatedRoute,
        private router: Router,
        private errorService: ErrorService,
        private downloadService: DownloadService,
        private documentService: DocumentService
    ) {
    }

    ngOnInit(): void {
        this.searchOptions.includeParents = true;
        this.runSearch();
    }

    runSearch(pageIndex = 0): Subject<DocumentSearchResponse> {

        this.searchOptions.pageIndex = pageIndex;

        const subject = new Subject<DocumentSearchResponse>();

        this.documentService.search(this.searchOptions)
            .subscribe({
                next: response => {
                    subject.next(response);
                    this.documents = response.documents;
                    this.headers = response.headers;
                },
                error: err => {
                    this.errorService.handleError(err, "Documents", "Load");
                }
            });

        return subject;

    }

    downloadDocument(document: Document, event: MouseEvent) {
        event.stopPropagation();

        this.downloadService.downloadDocument(document.documentId).subscribe();
    }

    goToDocument(document: Document): void {
        this.router.navigate(["/items", document.item.itemId, "documents", document.documentId]);
    }
}

