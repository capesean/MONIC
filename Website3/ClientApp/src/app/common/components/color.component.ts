import { Component, forwardRef, Output, EventEmitter, ViewChild } from '@angular/core';
import { ControlValueAccessor, NgModel, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator } from '@angular/forms';

@Component({
    selector: 'app-color',
    templateUrl: './color.component.html',
    styleUrls: ['./color.component.css'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => ColorComponent),
            multi: true
        },
        {
            provide: NG_VALIDATORS,
            multi: true,
            useExisting: ColorComponent
        }]
})
export class ColorComponent implements ControlValueAccessor, Validator {

    public hex: string;

    @ViewChild("picker") picker: NgModel;

    @Output() isValid: EventEmitter<boolean> = new EventEmitter<boolean>();

    constructor() { }

    onChanged: any = () => { };
    onTouched: any = () => { };
    onValidationChange: any = () => { };

    writeValue(val: any): void {
        this.hex = val;
        this.onChanged(val);
        //this.propagateChange(val);
    }
    registerOnChange(fn: any): void {
        this.onChanged = fn;
    }
    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }
    registerOnValidatorChange?(fn: () => void): void {
        this.onValidationChange = fn;
    }
    setDisabledState?(isDisabled: boolean): void {
        throw new Error('Method not implemented.');
    }
    validate(): ValidationErrors {
        return this.picker?.errors;
    }

}
