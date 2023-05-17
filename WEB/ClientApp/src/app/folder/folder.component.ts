import { Component, OnDestroy, OnInit } from '@angular/core';
import { ErrorService } from '../common/services/error.service';
import { FolderService, FolderView } from '../common/services/folder.service';
import { Folder } from '../common/models/folder.model';
import { Document } from '../common/models/document.model';
import { DownloadService } from '../common/services/download.service';
import { NavigationEnd, Router } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { Location } from '@angular/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs';
import { FolderContent } from '../common/models/foldercontent.model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FolderContentService } from '../common/services/foldercontent.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
    selector: 'folder',
    templateUrl: './folder.component.html',
})
export class FolderComponent implements OnInit, OnDestroy {

    public crumbs: Crumb[] = [];
    private routerSubscription: Subscription;
    private initialized = false;
    public selectedFolderContent: FolderContent;

    constructor(
        private errorService: ErrorService,
        private folderService: FolderService,
        private downloadService: DownloadService,
        private router: Router,
        private location: Location,
        private modalService: NgbModal,
        private folderContentService: FolderContentService,
        private sanitizer: DomSanitizer
    ) {
        this.routerSubscription = router.events
            .pipe(filter(o => o instanceof NavigationEnd))
            .subscribe((data: any) => {
                // this occurs if the user hits the back button, then the crumbs and url do not match, so it needs to be rebuilt from the url
                var crumbsUrl = "/" + this.crumbs.map(o => o.folderView.folder?.folderId ?? "folder").join("/");
                if (this.initialized && crumbsUrl !== data.url) {
                    const segments = data.url.split("/").slice(1);
                    segments.forEach((segment: string, index: number) => {
                        // invalid
                        if (this.crumbs.length < index + 1) throw "Crumbs is missing a segment: " + segment;
                        // invalid
                        if ((this.crumbs[index].folderView.folder?.folderId ?? "folder") !== segment) throw "Crumbs has a differing segment: " + segment + " vs " + this.crumbs[index].path;
                        // last segment is different, so remove the rest
                        if (index === segments.length - 1 && this.crumbs.length > index + 1) this.crumbs.splice(index + 1);
                    });
                }
            });

    }

    ngOnInit() {
        const segments = this.location.path().split('/');
        this.loadSegment(segments.slice(1));
        this.initialized = true;
    }

    ngOnDestroy(): void {
        this.routerSubscription.unsubscribe();
    }

    private loadFolder(folderId: string): Observable<FolderView> {
        return this.folderService.view(folderId)
            .pipe(
                tap(folderView => {
                    this.crumbs.push({ path: folderView.folder?.name ?? 'Folders', folderView, index: this.crumbs.length } as Crumb);
                })
            );
    }

    private loadSegment(segments: string[]) {
        const segment = segments[0];
        const id = segment === 'folder' ? undefined : segment;
        this.loadFolder(id)
            .subscribe({
                next: () => {
                    if (segments.length > 1) this.loadSegment(segments.slice(1));
                },
                error: err => this.errorService.handleError(err, "Folder", "View")
            });

    }

    selectFolder(folder: Folder): void {
        this.loadFolder(folder.folderId)
            .subscribe({
                next: () => {
                    this.setUrl()
                },
                error: err => this.errorService.handleError(err, "Folder", "View")
            });
    }

    private setUrl() {
        this.router.navigate(['/folder' + this.crumbs.filter(o => !!o.folderView.folder).map(o => '/' + o.folderView.folder.folderId).join("")]);
    }

    selectCrumb(crumb: Crumb): void {
        this.crumbs = this.crumbs.slice(0, crumb.index + 1);
        this.setUrl()
    }

    selectDocument(document: Document): void {
        this.downloadService.downloadDocument(document.documentId).subscribe();
    }

    selectFolderContent(folderContentView: any, folderContent: FolderContent): void {
        this.selectedFolderContent = undefined;
        this.folderService.getFolderContent(folderContent.folderContentId)
            .subscribe({
                next: folderContent => {
                    this.modalService.open(folderContentView, { size: 'xl', centered: true, scrollable: false }).result.then(
                        () => this.selectedFolderContent,
                        () => this.selectedFolderContent = undefined
                    );
                    setTimeout(() => this.selectedFolderContent = folderContent, 500);
                },
                error: err => this.errorService.handleError(err, "Content", "Load")
            });

    }

    sanitize(input: string): string {
        return this.sanitizer.bypassSecurityTrustHtml(input) as string;
    }

}

class Crumb {
    path: string;
    folderView: FolderView;
    index: number;
}
