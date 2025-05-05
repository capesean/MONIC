import { Component as NgComponent, OnInit, forwardRef, ViewChild, Input, EventEmitter, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DocumentModalComponent } from './document.modal.component';
import { Document } from '../../common/models/document.model';
import { Enum } from '../../common/models/enums.model';
import { Item } from '../../common/models/item.model';

@NgComponent({
    selector: 'document-select',
    templateUrl: './document.select.component.html',
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => DocumentSelectComponent),
        multi: true
    }],
    host: { 'class': 'app-select' },
    standalone: false
})
export class DocumentSelectComponent implements OnInit, ControlValueAccessor {

    @Input() document: Document;
    @Input() documents: Document[] = [];
    @Output() documentChange = new EventEmitter<Document>();
    @Output() documentsChange = new EventEmitter<Document[]>();
    @Input() canRemoveFilters = false;
    @Input() multiple = false;
    @Input() showAddNew = false;
    @Input() item: Item;

    disabled = false;
    placeholder = this.multiple ? "Select documents" : "Select a document";

    @ViewChild('modal') modal: DocumentModalComponent;

    constructor(
    ) {
    }

    ngOnInit(): void {
    }

    propagateChange = (_: any) => { };

    writeValue(documentId: string | string[]): void {
        if (documentId !== undefined) {
            this.propagateChange(documentId);
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

    changed(document: Document | Document[]) {
        if (this.disabled) return;
        if (this.multiple) {
            this.writeValue(document ? (document as Document[]).map(o => o.documentId) : null);
            this.documents = (document as Document[]);
            this.documentsChange.emit((document as Document[]));
        } else {
            this.writeValue(document ? (document as Document).documentId : null);
            this.document = (document as Document);
            this.documentChange.emit((document as Document));
        }
    }

    getLabel() {
        return this.multiple ? this.documents.map(document => document.fileName).join(", ") : this.document?.fileName ?? "";
    }

    click(button = false) {
        if (this.disabled) return;
        // clear the selector if there is something there already
        if (button && (this.document || this.documents.length)) this.changed(this.multiple ? [] : null);
        else this.modal.open();
    }

    clear() {
        this.changed(this.multiple ? [] : null);
    }
}

