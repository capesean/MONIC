import { Component as NgComponent, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { PagingHeaders } from '../../common/models/http.model';
import { FolderContentSearchOptions, FolderContentSearchResponse, FolderContent } from '../../common/models/foldercontent.model';
import { FadeThenShrink } from '../../common/animations/fadethenshrink';
import { ErrorService } from '../../common/services/error.service';
import { FolderContentService } from '../../common/services/foldercontent.service';

@NgComponent({
    selector: 'foldercontent-list',
    templateUrl: './foldercontent.list.component.html',
    animations: [FadeThenShrink],
    standalone: false
})
export class FolderContentListComponent implements OnInit {

    public folderContents: FolderContent[] = [];
    public searchOptions = new FolderContentSearchOptions();
    public showSearchOptions = false;
    public headers = new PagingHeaders();

    constructor(
        public route: ActivatedRoute,
        private router: Router,
        private errorService: ErrorService,
        private folderContentService: FolderContentService
    ) {
    }

    ngOnInit(): void {
        this.searchOptions.includeParents = true;
        this.runSearch();
    }

    runSearch(pageIndex = 0): Subject<FolderContentSearchResponse> {

        this.searchOptions.pageIndex = pageIndex;

        const subject = new Subject<FolderContentSearchResponse>();

        this.folderContentService.search(this.searchOptions)
            .subscribe({
                next: response => {
                    subject.next(response);
                    this.folderContents = response.folderContents;
                    this.headers = response.headers;
                },
                error: err => {
                    this.errorService.handleError(err, "Folder Contents", "Load");
                }
            });

        return subject;

    }

    goToFolderContent(folderContent: FolderContent): void {
        this.router.navigate(["/folders", folderContent.folder.folderId, "foldercontents", folderContent.folderContentId]);
    }
}

