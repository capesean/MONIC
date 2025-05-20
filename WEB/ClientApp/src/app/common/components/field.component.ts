import { Component, OnInit, Input, EventEmitter, ChangeDetectorRef, Output, ViewChild } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR, Validator, AbstractControl, ValidationErrors, NG_VALIDATORS, NgModel } from "@angular/forms";
import { FieldTypes } from '../models/enums.model';
import { Field } from '../models/field.model';
//import { File } from './../models/file.model';
import { Option } from '../models/option.model';
import { DownloadService } from "../services/download.service";
import { ErrorService } from "../services/error.service";

enum ControlTypes {
    checkbox = 0,
    multipleCheckbox = 1,
    multipleSelect = 2,
    radioButton = 3,
    select = 4,
    textbox = 5,
    textArea = 6,
    //fileInput = 7,
    //date = 8
}

@Component({
    selector: 'field',
    templateUrl: './field.component.html',
    styleUrls: ['./field.component.css'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            multi: true,
            useExisting: FieldComponent
        },
        {
            provide: NG_VALIDATORS,
            multi: true,
            useExisting: FieldComponent
        }
    ],
    standalone: false
})
export class FieldComponent implements OnInit, ControlValueAccessor, Validator {

    public _field: Field;
    public controlName: string;
    public disabled = false;
    public checkboxes: Map<string, boolean> = new Map<string, boolean>();
    public controlType: ControlTypes;

    @ViewChild("checkbox") checkbox: NgModel;
    @ViewChild("multipleCheckbox") multipleCheckbox: NgModel;
    @ViewChild("multipleSelect") multipleSelect: NgModel;
    @ViewChild("radioButton") radioButton: NgModel;
    @ViewChild("select") select: NgModel;
    @ViewChild("textbox") textbox: NgModel;
    @ViewChild("textArea") textArea: NgModel;
//    @ViewChild("fileInput") fileInput: any;

    @Input() set field(field: Field) {
        this._field = field;
        this.setData();
    }
    @Output() isValid: EventEmitter<boolean> = new EventEmitter<boolean>();
    //@Input() file: File;
    @Input() fieldValues = new Map<string, string | string[] | Date | boolean>();

    constructor(
        private cdref: ChangeDetectorRef,
        private errorService: ErrorService,
        private downloadService: DownloadService
    ) {
    }

    output(optionId: string): string {
        return optionId + ": " + this.checkboxes.get(optionId);
    }

    ngOnInit() { }

    setData(): void {

        if (this._field.fieldType === FieldTypes.YesNo) this.controlType === ControlTypes.checkbox;
        //else if (this._field.fieldType === FieldTypes.File) this.controlType === ControlTypes.fileInput;
        else if (this._field.fieldType === FieldTypes.Text && !this._field.multiLine) this.controlType = ControlTypes.textbox;
        else if (this._field.fieldType === FieldTypes.Text && this._field.multiLine) this.controlType = ControlTypes.textArea;
        else if (this._field.fieldType === FieldTypes.Picklist && this._field.multiple && this._field.radioCheckbox) this.controlType = ControlTypes.multipleCheckbox;
        else if (this._field.fieldType === FieldTypes.Picklist && this._field.multiple && !this._field.radioCheckbox) this.controlType = ControlTypes.select;
        else if (this._field.fieldType === FieldTypes.Picklist && !this._field.multiple && this._field.radioCheckbox) this.controlType = ControlTypes.radioButton;
        else if (this._field.fieldType === FieldTypes.Picklist && !this._field.multiple && !this._field.radioCheckbox) this.controlType = ControlTypes.multipleSelect;
        else throw "Invalid control type";

        // input type=file label doesn't like it with dashes
        this.controlName = this._field.fieldId.replace(/-/g, "");

        this.cdref.detectChanges();
    }

    onChanged: any = () => { };
    onTouched: any = () => { };
    onValidationChange: any = () => { };

    private _value: string | string[];

    get value() {
        return this._value;
    }

    set value(value: any) {
        this._value = value;
        this.onChanged(this._value);
        this.onValidationChange();
    }

    writeValue(obj: any): void {
        this._value = obj;
        // checkbox lists used the map to store values, populate this map
        if (this._field.fieldType === FieldTypes.Picklist && this._field.multiple && this._field.radioCheckbox) {
            if (obj) (obj as string[]).forEach(o => this.checkboxes.set(o, true));
        }

    }

    registerOnChange(fn: any): void {
        this.onChanged = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    setDisabledState?(isDisabled: boolean): void { }

    validate(): ValidationErrors {
        
        if (this.controlType === ControlTypes.checkbox) return this.checkbox?.errors;
        if (this.controlType === ControlTypes.multipleSelect) return this.multipleSelect?.errors;
        if (this.controlType === ControlTypes.radioButton) return this.radioButton?.errors;
        if (this.controlType === ControlTypes.multipleCheckbox) return this.multipleCheckbox?.errors;
        if (this.controlType === ControlTypes.select) return this.select?.errors;
        if (this.controlType === ControlTypes.textbox) return this.textbox?.errors;
        if (this.controlType === ControlTypes.textArea) return this.textArea?.errors;

        //if (this.controlType === ControlTypes.fileInput) return this.fileInput?.errors;

        throw "Invalid control type in validate()";
    }

    registerOnValidatorChange?(fn: () => void): void {
        this.onValidationChange = fn;
    }

    download(): void {
        throw "not implemented";
    }

    checkboxChanged(option: Option, $event: boolean) {
        this.checkboxes.set(option.optionId, $event)
        const index = (this.value as string[]).indexOf(option.optionId);
        if (index >= 0) (this.value as string[]).splice(index, 1);
        else (this.value as string[]).push(option.optionId);
    }

}
