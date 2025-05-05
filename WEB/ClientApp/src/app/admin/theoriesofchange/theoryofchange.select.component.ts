import { Component as NgComponent, OnInit, forwardRef, ViewChild, Input, EventEmitter, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { TheoryOfChangeModalComponent } from './theoryofchange.modal.component';
import { TheoryOfChange } from '../../common/models/theoryofchange.model';
import { Enum } from '../../common/models/enums.model';

@NgComponent({
    selector: 'theory-of-change-select',
    templateUrl: './theoryofchange.select.component.html',
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => TheoryOfChangeSelectComponent),
        multi: true
    }],
    host: { 'class': 'app-select' },
    standalone: false
})
export class TheoryOfChangeSelectComponent implements OnInit, ControlValueAccessor {

    @Input() theoryOfChange: TheoryOfChange;
    @Input() theoriesOfChange: TheoryOfChange[] = [];
    @Output() theoryOfChangeChange = new EventEmitter<TheoryOfChange>();
    @Output() theoriesOfChangeChange = new EventEmitter<TheoryOfChange[]>();
    @Input() canRemoveFilters = false;
    @Input() multiple = false;
    @Input() showAddNew = false;

    disabled = false;
    placeholder = this.multiple ? "Select theories of change" : "Select a theory of change";

    @ViewChild('modal') modal: TheoryOfChangeModalComponent;

    constructor(
    ) {
    }

    ngOnInit(): void {
    }

    propagateChange = (_: any) => { };

    writeValue(theoryOfChangeId: string | string[]): void {
        if (theoryOfChangeId !== undefined) {
            this.propagateChange(theoryOfChangeId);
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

    changed(theoryOfChange: TheoryOfChange | TheoryOfChange[]) {
        if (this.disabled) return;
        if (this.multiple) {
            this.writeValue(theoryOfChange ? (theoryOfChange as TheoryOfChange[]).map(o => o.theoryOfChangeId) : null);
            this.theoriesOfChange = (theoryOfChange as TheoryOfChange[]);
            this.theoriesOfChangeChange.emit((theoryOfChange as TheoryOfChange[]));
        } else {
            this.writeValue(theoryOfChange ? (theoryOfChange as TheoryOfChange).theoryOfChangeId : null);
            this.theoryOfChange = (theoryOfChange as TheoryOfChange);
            this.theoryOfChangeChange.emit((theoryOfChange as TheoryOfChange));
        }
    }

    getLabel() {
        return this.multiple ? this.theoriesOfChange.map(theoryOfChange => theoryOfChange.name).join(", ") : this.theoryOfChange?.name ?? "";
    }

    click(button = false) {
        if (this.disabled) return;
        // clear the selector if there is something there already
        if (button && (this.theoryOfChange || this.theoriesOfChange.length)) this.changed(this.multiple ? [] : null);
        else this.modal.open();
    }

    clear() {
        this.changed(this.multiple ? [] : null);
    }
}

