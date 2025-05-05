import { Component as NgComponent, OnInit, forwardRef, ViewChild, Input, EventEmitter, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { FieldModalComponent } from './field.modal.component';
import { Field } from '../../common/models/field.model';
import { Enum } from '../../common/models/enums.model';
import { Group } from '../../common/models/group.model';

@NgComponent({
    selector: 'field-select',
    templateUrl: './field.select.component.html',
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => FieldSelectComponent),
        multi: true
    }],
    host: { 'class': 'app-select' },
    standalone: false
})
export class FieldSelectComponent implements OnInit, ControlValueAccessor {

    @Input() field: Field;
    @Input() fields: Field[] = [];
    @Output() fieldChange = new EventEmitter<Field>();
    @Output() fieldsChange = new EventEmitter<Field[]>();
    @Input() canRemoveFilters = false;
    @Input() multiple = false;
    @Input() showAddNew = false;
    @Input() fieldType: Enum;
    @Input() organisation: boolean;
    @Input() entity: boolean;
    @Input() indicator: boolean;
    @Input() group: Group;

    disabled = false;
    placeholder = this.multiple ? "Select fields" : "Select a field";

    @ViewChild('modal') modal: FieldModalComponent;

    constructor(
    ) {
    }

    ngOnInit(): void {
    }

    propagateChange = (_: any) => { };

    writeValue(fieldId: string | string[]): void {
        if (fieldId !== undefined) {
            this.propagateChange(fieldId);
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

    changed(field: Field | Field[]) {
        if (this.disabled) return;
        if (this.multiple) {
            this.writeValue(field ? (field as Field[]).map(o => o.fieldId) : null);
            this.fields = (field as Field[]);
            this.fieldsChange.emit((field as Field[]));
        } else {
            this.writeValue(field ? (field as Field).fieldId : null);
            this.field = (field as Field);
            this.fieldChange.emit((field as Field));
        }
    }

    getLabel() {
        return this.multiple ? this.fields.map(field => field.name).join(", ") : this.field?.name ?? "";
    }

    click(button = false) {
        if (this.disabled) return;
        // clear the selector if there is something there already
        if (button && (this.field || this.fields.length)) this.changed(this.multiple ? [] : null);
        else this.modal.open();
    }

    clear() {
        this.changed(this.multiple ? [] : null);
    }
}

