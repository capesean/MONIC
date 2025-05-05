import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { Field } from '../models/field.model';
import { Group } from '../models/group.model';
import { FieldTypes, ItemTypes } from '../models/enums.model';
import { IHasFields } from '../models/ihasfields.model';
import { NgForm } from '@angular/forms';
import { ErrorService } from '../services/error.service';
import { AsyncSubject, Subject } from 'rxjs';
import { FieldValue } from '../models/fieldvalue.model';
import { OptionValue } from '../models/optionvalue.model';
import moment from 'moment';
import { DocumentService } from '../services/document.service';
import { PagingHeaders } from '../models/http.model';
import { Document, DocumentSearchOptions, DocumentSearchResponse } from '../models/document.model';
import { DocumentManageComponent } from '../../admin/documents/document.manage.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Item } from '../models/item.model';
import { AppService } from '../services/app.service';

@Component({
    template: '',
    standalone: false
})
export abstract class ItemComponent {

    private item: Item;

    @ViewChild('form') form: NgForm;

    // fields and options applicable to this item type
    public groups: Group[] = [];
    public fields: Field[] = [];

    // the values for fields, selected options, etc. will be stored in this fieldValues property
    public fieldValues = new Map<string, string | string[] | Date | boolean>();

    // for displaying the documents tab
    public documentSearchOptions = new DocumentSearchOptions();
    public documentHeaders = new PagingHeaders();
    public documents: Document[] = [];
    public showDocumentsSearch = false;

    constructor(
        protected appService: AppService,
        protected errorService: ErrorService,
        protected cdref: ChangeDetectorRef,
        protected documentService: DocumentService,
        protected modalService: NgbModal
    ) { }

    private _prepareFields$: AsyncSubject<void>;
    private prepareFields(itemType: ItemTypes): AsyncSubject<void> {

        /*
         * getFieldData loads the fields & options if they haven't been loaded before
         * 
         */

        // todo: getProfile should be like this?
        if (!this._prepareFields$) {
            this._prepareFields$ = new AsyncSubject();
            this.appService.getFieldData()
                .subscribe({
                    next: fieldData => {
                        this.fields = fieldData.fields.filter(o => {
                            if (itemType === ItemTypes.Entity) return o.entity;
                            if (itemType === ItemTypes.Indicator) return o.indicator;
                            if (itemType === ItemTypes.Organisation) return o.organisation;
                            if (itemType === ItemTypes.Component) return o.component;
                            if (itemType === ItemTypes.Relationship) return o.relationship;
                            if (itemType === ItemTypes.Folder) return o.folder;
                            throw "Invalid itemType in setItem";
                        });
                        this.groups = fieldData.groups.filter(o => this.fields.filter(f => f.groupId === o.groupId).length);
                        this._prepareFields$.next();
                        this._prepareFields$.complete();
                    },
                    error: err => this.errorService.handleError(err, "Field Data", "Load")
                });
        }
        return this._prepareFields$;
    }

    public setItem(itemObject: IHasFields, item: Item): void {

        /*
         * setItem() is called when the item has been loaded from the API
         * it populates the .fieldValues array with the values for fields, options, etc.
         * it requires the fields & options to be loaded first, so that is the first step
         */

        this.documentSearchOptions.itemId = item.itemId;

        // store the item type
        this.item = item;

        // load & filter/prepare the groups, fields & options
        this.prepareFields(item.itemType).subscribe(() => {

            // extract the field values from userOptions and userFields into the fieldValues dictionary,
            // which is used for binding the ngModels
            if (!this.fields || !this.fields.length) return;

            this.fieldValues = new Map<string, string>();
            this.fields.forEach(field => {
                if (field.fieldType === FieldTypes.Picklist) {
                    /*
                     * the selected options are stored in the item's .optionValues array.
                     * the <field> control binds to the .fieldValues property of this ItemComponent
                     * therefore we need to 'convert' the item's .optionValue(s) to this ItemComponent's .fieldValues
                     * 
                     */

                    // first: get an array of the optionIds for this field
                    const optionIds = field.options.map(o => o.optionId);
                    let value = undefined as string | string[];

                    if (field.multiple) {
                        //  find all (.filter) the item's options for this field (i.e. in the optionIds array) and convert those to an array of selectedOptionIds
                        value = itemObject.optionValues.filter(o => optionIds.indexOf(o.optionId) >= 0).map(o => o.optionId);
                    }
                    else {
                        //  find the first (.find) item's option for this field (i.e. in the optionIds array) and get the optionId
                        value = itemObject.optionValues.find(o => optionIds.indexOf(o.optionId) >= 0)?.optionId;
                    }

                    // store the selectedOptionId(s) in this ItemComponent's .fieldValues property
                    this.fieldValues.set(field.fieldId, value);

                } else if (field.fieldType === FieldTypes.Date) {
                    const value = itemObject.fieldValues.find(o => o.fieldId === field.fieldId)?.value;
                    this.fieldValues.set(field.fieldId, value ? new Date(value) : undefined);
                } else if (field.fieldType === FieldTypes.Text) {
                    this.fieldValues.set(field.fieldId, itemObject.fieldValues.find(o => o.fieldId === field.fieldId)?.value);
                } else if (field.fieldType === FieldTypes.YesNo) {
                    this.fieldValues.set(field.fieldId, itemObject.fieldValues.find(o => o.fieldId === field.fieldId)?.value === "Yes");
                    //} else if (field.fieldType === FieldTypes.File) {
                    //    let file = this.organisation.files.find(o => o.fieldId === field.fieldId);
                    //    if (!file) file = { organisationId: this.organisation.id, fieldId: field.fieldId } as File;
                    //    this.fieldValues.set(field.fieldId, file;
                    //    this.files[field.fieldId] = file;
                } else {
                    throw "Unhandled field in setFields";
                }
            })

            this.cdref.detectChanges();

        })

    }

    public goToDocument(document: Document): void {
        let modalRef = this.modalService.open(DocumentManageComponent, { size: 'xl', centered: true, scrollable: true });
        (modalRef.componentInstance as DocumentManageComponent).setDocument(document);
        modalRef.result.then(
            () => {
                // todo: handle errors?
                this.searchDocuments(this.documentHeaders.pageIndex).subscribe();

            }, () => { });
    }

    public showDocumentManageModal() {
        let modalRef = this.modalService.open(DocumentManageComponent, { size: 'xl', centered: true, scrollable: true });
        (modalRef.componentInstance as DocumentManageComponent).setItem(this.item);
        modalRef.result.then(
            () => {
                // todo: handle errors?
                this.searchDocuments(this.documentHeaders.pageIndex).subscribe();

            }, () => { });
    }

    protected getData(itemObject: IHasFields) {

        // extract the field values from the this.fieldValues dictionary into the fieldValues/optionValues/etc. to save via the API

        itemObject.fieldValues = [];
        itemObject.optionValues = [];
        //this.item.files = [];

        this.fields.forEach(field => {

            const value = this.fieldValues.get(field.fieldId);

            // there is no value stored in this.fieldValues for this field, so no need to add it to any array (fieldValues/optionValues/etc.)
            if (!value || (Array.isArray(value) && (value as string[]).length === 0)) return;

            if (field.fieldType === FieldTypes.Picklist) {
                // push each of the values into the optionValues array
                if (field.multiple) (value as string[]).forEach(o => itemObject.optionValues.push({ itemId: this.item.itemId, optionId: o } as OptionValue))
                // push the selected value into the optionValues array
                else itemObject.optionValues.push({ itemId: this.item.itemId, optionId: value } as OptionValue);
            } else if (field.fieldType === FieldTypes.Date) {
                itemObject.fieldValues.push({ itemId: this.item.itemId, fieldId: field.fieldId, value: moment(value as string).format("DD MMMM YYYY") } as FieldValue);
            } else if (field.fieldType === FieldTypes.Text) {
                itemObject.fieldValues.push({ itemId: this.item.itemId, fieldId: field.fieldId, value: value } as FieldValue);
            } else if (field.fieldType === FieldTypes.YesNo) {
                itemObject.fieldValues.push({ itemId: this.item.itemId, fieldId: field.fieldId, value: value === true ? "Yes" : "No" } as FieldValue);
                //} else if (field.fieldType === FieldTypes.File) {
                //    const file = this.files[field.fieldId];
                //    if (file.fileContents) item.files.push(file);
            } else {
                throw "Unhandled field in save";
            }
        });

    }

    protected updateValueAndValidity(form: NgForm): void {
        Object.keys(form.controls).forEach(key => {
            this.form.controls[key].updateValueAndValidity();
        });

    }

    public searchDocuments(pageIndex = 0): Subject<DocumentSearchResponse> {

        this.documentSearchOptions.pageIndex = pageIndex;

        const subject = new Subject<DocumentSearchResponse>()

        this.documentService.search(this.documentSearchOptions)
            .subscribe({
                next: response => {
                    subject.next(response);
                    this.documents = response.documents;
                    this.documentHeaders = response.headers;
                },
                error: err => {
                    this.errorService.handleError(err, "Documents", "Load");
                }
            });

        return subject;
    };

}
