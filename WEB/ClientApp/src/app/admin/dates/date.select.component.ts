import { Component as NgComponent, OnInit, forwardRef, ViewChild, Input, EventEmitter, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DateModalComponent } from './date.modal.component';
import { Date } from '../../common/models/date.model';
import { Enum } from '../../common/models/enums.model';

@NgComponent({
    selector: 'date-select',
    templateUrl: './date.select.component.html',
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => DateSelectComponent),
        multi: true
    }],
    host: { 'class': 'app-select' }
})
export class DateSelectComponent implements OnInit, ControlValueAccessor {

    @Input() date: Date;
    @Input() dates: Date[] = [];
    @Output() dateChange = new EventEmitter<Date>();
    @Output() datesChange = new EventEmitter<Date[]>();
    @Input() canRemoveFilters = false;
    @Input() multiple = false;
    @Input() showAddNew = false;
    @Input() dateType: Enum;
    @Input() quarter: Date;
    @Input() year: Date;
    @Input() isOpen: boolean;
    @Input() hasOpened: boolean;

    disabled = false;
    placeholder = this.multiple ? "Select dates" : "Select a date";

    @ViewChild('modal') modal: DateModalComponent;

    constructor(
    ) {
    }

    ngOnInit(): void {
    }

    propagateChange = (_: any) => { };

    writeValue(dateId: string | string[]): void {
        if (dateId !== undefined) {
            this.propagateChange(dateId);
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

    changed(date: Date | Date[]) {
        if (this.disabled) return;
        if (this.multiple) {
            this.writeValue(date ? (date as Date[]).map(o => o.dateId) : null);
            this.dates = (date as Date[]);
            this.datesChange.emit((date as Date[]));
        } else {
            this.writeValue(date ? (date as Date).dateId : null);
            this.date = (date as Date);
            this.dateChange.emit((date as Date));
        }
    }

    getLabel() {
        return this.multiple ? this.dates.map(date => date.name).join(", ") : this.date?.name ?? "";
    }

    click(button = false) {
        if (this.disabled) return;
        // clear the selector if there is something there already
        if (button && (this.date || this.dates.length)) this.changed(this.multiple ? [] : null);
        else this.modal.open();
    }
}
