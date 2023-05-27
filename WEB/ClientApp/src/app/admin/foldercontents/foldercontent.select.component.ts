import { Component as NgComponent, OnInit, forwardRef, ViewChild, Input, EventEmitter, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { FolderContentModalComponent } from './foldercontent.modal.component';
import { FolderContent } from '../../common/models/foldercontent.model';
import { Enum } from '../../common/models/enums.model';
import { Folder } from '../../common/models/folder.model';
import { User } from '../../common/models/user.model';

@NgComponent({
    selector: 'folder-content-select',
    templateUrl: './foldercontent.select.component.html',
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => FolderContentSelectComponent),
        multi: true
    }],
    host: { 'class': 'app-select' }
})
export class FolderContentSelectComponent implements OnInit, ControlValueAccessor {

    @Input() folderContent: FolderContent;
    @Input() folderContents: FolderContent[] = [];
    @Output() folderContentChange = new EventEmitter<FolderContent>();
    @Output() folderContentsChange = new EventEmitter<FolderContent[]>();
    @Input() canRemoveFilters = false;
    @Input() multiple = false;
    @Input() showAddNew = false;
    @Input() folder: Folder;
    @Input() addedBy: User;

    disabled = false;
    placeholder = this.multiple ? "Select folder contents" : "Select a folder content";

    @ViewChild('modal') modal: FolderContentModalComponent;

    constructor(
    ) {
    }

    ngOnInit(): void {
    }

    propagateChange = (_: any) => { };

    writeValue(folderContentId: string | string[]): void {
        if (folderContentId !== undefined) {
            this.propagateChange(folderContentId);
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

    changed(folderContent: FolderContent | FolderContent[]) {
        if (this.disabled) return;
        if (this.multiple) {
            this.writeValue(folderContent ? (folderContent as FolderContent[]).map(o => o.folderContentId) : null);
            this.folderContents = (folderContent as FolderContent[]);
            this.folderContentsChange.emit((folderContent as FolderContent[]));
        } else {
            this.writeValue(folderContent ? (folderContent as FolderContent).folderContentId : null);
            this.folderContent = (folderContent as FolderContent);
            this.folderContentChange.emit((folderContent as FolderContent));
        }
    }

    getLabel() {
        return this.multiple ? this.folderContents.map(folderContent => folderContent.name).join(", ") : this.folderContent?.name ?? "";
    }

    click(button = false) {
        if (this.disabled) return;
        // clear the selector if there is something there already
        if (button && (this.folderContent || this.folderContents.length)) this.changed(this.multiple ? [] : null);
        else this.modal.open();
    }
}
