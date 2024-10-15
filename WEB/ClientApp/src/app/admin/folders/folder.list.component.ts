import { Component as NgComponent, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { PagingHeaders } from '../../common/models/http.model';
import { FolderSearchOptions, FolderSearchResponse, Folder } from '../../common/models/folder.model';
import { FadeThenShrink } from '../../common/animations/fadethenshrink';
import { ErrorService } from '../../common/services/error.service';
import { FolderService } from '../../common/services/folder.service';

@NgComponent({
    selector: 'folder-list',
    templateUrl: './folder.list.component.html',
    animations: [FadeThenShrink]
})
export class FolderListComponent implements OnInit, OnDestroy {

    public folders: Folder[] = [];
    public searchOptions = new FolderSearchOptions();
    public showSearchOptions = false;
    public headers = new PagingHeaders();
    private routerSubscription: Subscription;

    constructor(
        public route: ActivatedRoute,
        private router: Router,
        private errorService: ErrorService,
        private folderService: FolderService
    ) {
    }

    ngOnInit(): void {
        this.searchOptions.includeParents = true;
        this.routerSubscription = this.router.events.subscribe(event => {
            if (event instanceof NavigationEnd && !this.route.firstChild) {
                this.runSearch();
            }
        });
        this.runSearch();
    }

    ngOnDestroy(): void {
        this.routerSubscription.unsubscribe();
    }

    runSearch(pageIndex = 0): Subject<FolderSearchResponse> {

        this.searchOptions.pageIndex = pageIndex;

        const subject = new Subject<FolderSearchResponse>();

        this.folderService.search(this.searchOptions)
            .subscribe({
                next: response => {
                    subject.next(response);
                    this.folders = response.folders;
                    this.headers = response.headers;
                },
                error: err => {
                    this.errorService.handleError(err, "Folders", "Load");
                }
            });

        return subject;

    }

    goToFolder(folder: Folder): void {
        this.router.navigate([folder.folderId], { relativeTo: this.route });
    }
}

