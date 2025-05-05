import { Component as NgComponent, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FolderShortcutSettings, Widget } from '../models/widget.model';
import { FolderService, FolderView } from '../services/folder.service';

@NgComponent({
    selector: 'app-folder-shortcut',
    templateUrl: './folder.shortcut.component.html',
    standalone: false
})
export class FolderShortcutComponent implements OnInit, Widget {

    @Output() loading: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() error: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() title: EventEmitter<string> = new EventEmitter<string>(true);
    @Output() subtitle: EventEmitter<string> = new EventEmitter<string>();

    private _settings: FolderShortcutSettings;
    @Input() set settings(s: FolderShortcutSettings) {
        if (!s) return;
        this._settings = s;
        this.load();
    }

    public folderView: FolderView;

    constructor(
        private folderService: FolderService
    ) {
    }

    ngOnInit(): void {
    }

    public load(): void {
        if (!this._settings.folderId) {
            this.loading.emit(false);
            this.error.emit(true);
            return;
        }

        this.folderService.view(this._settings.folderId)
            .subscribe({
                next: folderView => {
                    this.folderView = folderView;
                    this.title.emit(folderView.folder.name);
                    this.loading.emit(false);
                    this.error.emit(false);
                },
                error: () => {
                    this.loading.emit(false);
                    this.error.emit(true);
                }
            });

    }
}
