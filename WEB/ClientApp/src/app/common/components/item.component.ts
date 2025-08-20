import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { Field } from '../models/field.model';
import { Group } from '../models/group.model';
import { ItemTypes } from '../models/enums.model';
import { IHasFields } from '../models/ihasfields.model';
import { NgForm } from '@angular/forms';
import { ErrorService } from '../services/error.service';
import { map, Observable, shareReplay, Subject } from 'rxjs';
import { Document, DocumentSearchOptions, DocumentSearchResponse } from '../models/document.model';
import { DocumentManageComponent } from '../../admin/documents/document.manage.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Item } from '../models/item.model';
import { AppService } from '../services/app.service';
import { PagingHeaders } from '../models/http.model';
import { DocumentService } from '../services/document.service';
import { FieldValueMapperService } from '../services/field-value-mapper.service';
import { ItemFieldMap } from '../models/fieldvalue.model';

@Component({
    template: '',
    standalone: false
})
export abstract class ItemComponent {

    private item: Item;

    @ViewChild('form') form: NgForm;

    public groups: Group[] = [];
    public fields: Field[] = [];
    public itemFields: ItemFieldMap = new Map();

    public documentSearchOptions = new DocumentSearchOptions();
    public documentHeaders = new PagingHeaders();
    public documents: Document[] = [];
    public showDocumentsSearch = false;

    private prepareFieldsCache: { [key in ItemTypes]?: Observable<void> } = {};

    constructor(
        protected appService: AppService,
        protected errorService: ErrorService,
        protected cdref: ChangeDetectorRef,
        protected documentService: DocumentService,
        protected modalService: NgbModal,
        protected fieldValueMapper: FieldValueMapperService
    ) { }

    private prepareFields(itemType: ItemTypes): Observable<void> {
        if (!this.prepareFieldsCache[itemType]) {
            this.prepareFieldsCache[itemType] = this.appService.getFieldData().pipe(
                map(fieldData => {
                    this.fields = fieldData.fields.filter(o => {
                        if (itemType === ItemTypes.Entity) return o.entity;
                        if (itemType === ItemTypes.Indicator) return o.indicator;
                        if (itemType === ItemTypes.Organisation) return o.organisation;
                        if (itemType === ItemTypes.Component) return o.component;
                        if (itemType === ItemTypes.Relationship) return o.relationship;
                        if (itemType === ItemTypes.Folder) return o.folder;
                        if (itemType === ItemTypes.Category) return o.category;
                        throw new Error("Invalid itemType in setItem");
                    });
                    this.groups = fieldData.groups.filter(o =>
                        this.fields.some(f => f.groupId === o.groupId)
                    );
                }),
                shareReplay(1)
            );
        }
        return this.prepareFieldsCache[itemType]!;
    }


    public setItem(itemObject: IHasFields, item: Item): void {
        this.documentSearchOptions.itemId = item.itemId;
        this.item = item;

        this.prepareFields(item.itemType).subscribe({
            next: () => {
                if (!this.fields || !this.fields.length) return;

                // ensure arrays exist on the object
                if (!itemObject.itemFields) itemObject.itemFields = [];
                if (!itemObject.itemOptions) itemObject.itemOptions = [];

                this.itemFields = this.fieldValueMapper.mapItemToFields(itemObject, this.fields);
                this.cdref.detectChanges();
            },
            error: err => this.errorService.handleError(err, "Field Data", "Load")
        });
    }

    protected getData(itemObject: IHasFields) {
        const mapped = this.fieldValueMapper.mapFieldsToItem(this.itemFields, this.fields, this.item);
        itemObject.itemFields = mapped.itemFields;
        itemObject.itemOptions = mapped.itemOptions;
    }

    protected updateValueAndValidity(form: NgForm): void {
        Object.keys(form.controls).forEach(key => {
            this.form.controls[key].updateValueAndValidity();
        });
    }

    public goToDocument(document: Document): void {
        let modalRef = this.modalService.open(DocumentManageComponent, { size: 'xl', centered: true, scrollable: true });
        (modalRef.componentInstance as DocumentManageComponent).setDocument(document);
        modalRef.result.then(
            () => this.searchDocuments(this.documentHeaders.pageIndex).subscribe(),
            () => { }
        );
    }

    public showDocumentManageModal() {
        let modalRef = this.modalService.open(DocumentManageComponent, { size: 'xl', centered: true, scrollable: true });
        (modalRef.componentInstance as DocumentManageComponent).setItem(this.item);
        modalRef.result.then(
            () => this.searchDocuments(this.documentHeaders.pageIndex).subscribe(),
            () => { }
        );
    }

    public searchDocuments(pageIndex = 0): Subject<DocumentSearchResponse> {
        this.documentSearchOptions.pageIndex = pageIndex;
        const subject = new Subject<DocumentSearchResponse>();

        this.documentService.search(this.documentSearchOptions).subscribe({
            next: response => {
                subject.next(response);
                this.documents = response.documents;
                this.documentHeaders = response.headers;
            },
            error: err => this.errorService.handleError(err, "Documents", "Load")
        });

        return subject;
    }
}
