import { Component as NgComponent, OnInit, forwardRef, ViewChild, Input, EventEmitter, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { LogFrameRowModalComponent } from './logframerow.modal.component';
import { LogFrameRow } from '../../common/models/logframerow.model';
import { Enum } from '../../common/models/enums.model';
import { LogFrame } from '../../common/models/logframe.model';

@NgComponent({
    selector: 'log-frame-row-select',
    templateUrl: './logframerow.select.component.html',
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => LogFrameRowSelectComponent),
        multi: true
    }],
    host: { 'class': 'app-select' },
    standalone: false
})
export class LogFrameRowSelectComponent implements OnInit, ControlValueAccessor {

    @Input() logFrameRow: LogFrameRow;
    @Input() logFrameRows: LogFrameRow[] = [];
    @Output() logFrameRowChange = new EventEmitter<LogFrameRow>();
    @Output() logFrameRowsChange = new EventEmitter<LogFrameRow[]>();
    @Input() canRemoveFilters = false;
    @Input() multiple = false;
    @Input() showAddNew = false;
    @Input() logFrame: LogFrame;
    @Input() rowType: Enum;

    disabled = false;
    placeholder = this.multiple ? "Select logframe rows" : "Select a logframe row";

    @ViewChild('modal') modal: LogFrameRowModalComponent;

    constructor(
    ) {
    }

    ngOnInit(): void {
    }

    propagateChange = (_: any) => { };

    writeValue(logFrameRowId: string | string[]): void {
        if (logFrameRowId !== undefined) {
            this.propagateChange(logFrameRowId);
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

    changed(logFrameRow: LogFrameRow | LogFrameRow[]) {
        if (this.disabled) return;
        if (this.multiple) {
            this.writeValue(logFrameRow ? (logFrameRow as LogFrameRow[]).map(o => o.logFrameRowId) : null);
            this.logFrameRows = (logFrameRow as LogFrameRow[]);
            this.logFrameRowsChange.emit((logFrameRow as LogFrameRow[]));
        } else {
            this.writeValue(logFrameRow ? (logFrameRow as LogFrameRow).logFrameRowId : null);
            this.logFrameRow = (logFrameRow as LogFrameRow);
            this.logFrameRowChange.emit((logFrameRow as LogFrameRow));
        }
    }

    getLabel() {
        return this.multiple ? this.logFrameRows.map(logFrameRow => logFrameRow.rowNumber).join(", ") : this.logFrameRow?.rowNumber ?? "";
    }

    click(button = false) {
        if (this.disabled) return;
        // clear the selector if there is something there already
        if (button && (this.logFrameRow || this.logFrameRows.length)) this.changed(this.multiple ? [] : null);
        else this.modal.open();
    }

    clear() {
        this.changed(this.multiple ? [] : null);
    }
}

