import { Component as NgComponent, OnInit, forwardRef, ViewChild, Input, EventEmitter, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { FolderModalComponent } from './folder.modal.component';
import { Folder } from '../../common/models/folder.model';
import { Enum } from '../../common/models/enums.model';

@NgComponent({
    selector: 'folder-select',
    templateUrl: './folder.select.component.html',
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => FolderSelectComponent),
        multi: true
    }],
    host: { 'class': 'app-select' },
    standalone: false
})
export class FolderSelectComponent implements OnInit, ControlValueAccessor {

    @Input() folder: Folder;
    @Input() folders: Folder[] = [];
    @Output() folderChange = new EventEmitter<Folder>();
    @Output() foldersChange = new EventEmitter<Folder[]>();
    @Input() canRemoveFilters = false;
    @Input() multiple = false;
    @Input() showAddNew = false;
    @Input() parentFolder: Folder;

    disabled = false;
    placeholder = this.multiple ? "Select folders" : "Select a folder";

    @ViewChild('modal') modal: FolderModalComponent;

    constructor(
    ) {
    }

    ngOnInit(): void {
    }

    propagateChange = (_: any) => { };

    writeValue(folderId: string | string[]): void {
        if (folderId !== undefined) {
            this.propagateChange(folderId);
        }
    }

    registerOnChange(fn: any): void {
        this.propagateChange = fn;
    }

    registerOnTouched(): void {
    }

    setDisabledState?(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }

    changed(folder: Folder | Folder[]) {
        if (this.disabled) return;
        if (this.multiple) {
            this.writeValue(folder ? (folder as Folder[]).map(o => o.folderId) : null);
            this.folders = (folder as Folder[]);
            this.foldersChange.emit((folder as Folder[]));
        } else {
            this.writeValue(folder ? (folder as Folder).folderId : null);
            this.folder = (folder as Folder);
            this.folderChange.emit((folder as Folder));
        }
    }

    getLabel() {
        return this.multiple ? this.folders.map(folder => folder.name).join(", ") : this.folder?.name ?? "";
    }

    click(button = false) {
        if (this.disabled) return;
        // clear the selector if there is something there already
        if (button && (this.folder || this.folders.length)) this.changed(this.multiple ? [] : null);
        else this.modal.open();
    }

    clear() {
        this.changed(this.multiple ? [] : null);
    }
}

