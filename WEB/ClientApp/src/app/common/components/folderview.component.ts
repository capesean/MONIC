import { Component, OnInit, Input } from "@angular/core";
import { Document } from "../models/document.model";
import { Folder } from "../models/folder.model";
import { DownloadService } from "../services/download.service";
import { ErrorService } from "../services/error.service";
import { FolderService } from "../services/folder.service";

@Component({
    selector: 'folderview',
    templateUrl: './folderview.component.html',
    standalone: false
})
export class FolderViewComponent implements OnInit {

    @Input() folder: Folder;
    public loaded = false;
    public loading = false;
    public subfolders: Folder[];
    public documents: Document[];

    constructor(
        private errorService: ErrorService,
        private downloadService: DownloadService,
        private folderService: FolderService
    ) {
    }

    ngOnInit(): void {

    }

    public load(): void {
        if (this.loading || this.loaded) return;
        this.loading = true;
        this.folderService.view(this.folder.folderId)
            .subscribe({
                next: folderView => {
                    this.subfolders = folderView.subfolders;
                    this.documents = folderView.documents;
                    this.loading = false;
                    this.loaded = true;
                },
                error: err => this.errorService.handleError(err, "Folder", "View")
            });
    }
}
