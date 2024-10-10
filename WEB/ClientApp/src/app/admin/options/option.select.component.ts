import { Component as NgComponent, OnInit, forwardRef, ViewChild, Input, EventEmitter, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { OptionModalComponent } from './option.modal.component';
import { Option } from '../../common/models/option.model';
import { Enum } from '../../common/models/enums.model';
import { Field } from '../../common/models/field.model';

@NgComponent({
    selector: 'option-select',
    templateUrl: './option.select.component.html',
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => OptionSelectComponent),
        multi: true
    }],
    host: { 'class': 'app-select' }
})
export class OptionSelectComponent implements OnInit, ControlValueAccessor {

    @Input() option: Option;
    @Input() options: Option[] = [];
    @Output() optionChange = new EventEmitter<Option>();
    @Output() optionsChange = new EventEmitter<Option[]>();
    @Input() canRemoveFilters = false;
    @Input() multiple = false;
    @Input() showAddNew = false;
    @Input() field: Field;

    disabled = false;
    placeholder = this.multiple ? "Select options" : "Select an option";

    @ViewChild('modal') modal: OptionModalComponent;

    constructor(
    ) {
    }

    ngOnInit(): void {
    }

    propagateChange = (_: any) => { };

    writeValue(optionId: string | string[]): void {
        if (optionId !== undefined) {
            this.propagateChange(optionId);
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

    changed(option: Option | Option[]) {
        if (this.disabled) return;
        if (this.multiple) {
            this.writeValue(option ? (option as Option[]).map(o => o.optionId) : null);
            this.options = (option as Option[]);
            this.optionsChange.emit((option as Option[]));
        } else {
            this.writeValue(option ? (option as Option).optionId : null);
            this.option = (option as Option);
            this.optionChange.emit((option as Option));
        }
    }

    getLabel() {
        return this.multiple ? this.options.map(option => option.name).join(", ") : this.option?.name ?? "";
    }

    click(button = false) {
        if (this.disabled) return;
        // clear the selector if there is something there already
        if (button && (this.option || this.options.length)) this.changed(this.multiple ? [] : null);
        else this.modal.open();
    }

    clear() {
        this.changed(this.multiple ? [] : null);
    }
}

