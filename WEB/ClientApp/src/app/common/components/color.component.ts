import { Component, forwardRef, Output, EventEmitter, ViewChild } from '@angular/core';
import { ControlValueAccessor, FormControl, NgControl, NgModel, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator } from '@angular/forms';

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

    public bg: string;
    public hex: string;
    public disabled: boolean;

    @ViewChild("picker") picker: FormControl;

    @Output() isValid: EventEmitter<boolean> = new EventEmitter<boolean>();

    constructor() { }

    onTouched: any = () => { };
    onValidationChange: any = () => { };

    propagateChange = (_: any) => { };

    writeValue(val: any): void {
        this.hex = val;
        this.bg = val ? val + " !important" : undefined;
        this.propagateChange(val);
    }
    registerOnChange(fn: any): void {
        this.propagateChange = fn;
    }
    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }
    registerOnValidatorChange?(fn: () => void): void {
        this.onValidationChange = fn;
    }
    setDisabledState?(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }
    validate(): ValidationErrors {
        return this.picker?.errors;
    }
    clear(): void {
        this.writeValue(undefined);
    }
}
