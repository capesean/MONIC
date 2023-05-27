import { Component as NgComponent, OnInit, forwardRef, ViewChild, Input, EventEmitter, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { LogFrameModalComponent } from './logframe.modal.component';
import { LogFrame } from '../../common/models/logframe.model';
import { Enum } from '../../common/models/enums.model';

@NgComponent({
    selector: 'log-frame-select',
    templateUrl: './logframe.select.component.html',
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => LogFrameSelectComponent),
        multi: true
    }],
    host: { 'class': 'app-select' }
})
export class LogFrameSelectComponent implements OnInit, ControlValueAccessor {

    @Input() logFrame: LogFrame;
    @Input() logFrames: LogFrame[] = [];
    @Output() logFrameChange = new EventEmitter<LogFrame>();
    @Output() logFramesChange = new EventEmitter<LogFrame[]>();
    @Input() canRemoveFilters = false;
    @Input() multiple = false;
    @Input() showAddNew = false;

    disabled = false;
    placeholder = this.multiple ? "Select logical frameworks" : "Select a logical framework";

    @ViewChild('modal') modal: LogFrameModalComponent;

    constructor(
    ) {
    }

    ngOnInit(): void {
    }

    propagateChange = (_: any) => { };

    writeValue(logFrameId: string | string[]): void {
        if (logFrameId !== undefined) {
            this.propagateChange(logFrameId);
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

    changed(logFrame: LogFrame | LogFrame[]) {
        if (this.disabled) return;
        if (this.multiple) {
            this.writeValue(logFrame ? (logFrame as LogFrame[]).map(o => o.logFrameId) : null);
            this.logFrames = (logFrame as LogFrame[]);
            this.logFramesChange.emit((logFrame as LogFrame[]));
        } else {
            this.writeValue(logFrame ? (logFrame as LogFrame).logFrameId : null);
            this.logFrame = (logFrame as LogFrame);
            this.logFrameChange.emit((logFrame as LogFrame));
        }
    }

    getLabel() {
        return this.multiple ? this.logFrames.map(logFrame => logFrame.name).join(", ") : this.logFrame?.name ?? "";
    }

    click(button = false) {
        if (this.disabled) return;
        // clear the selector if there is something there already
        if (button && (this.logFrame || this.logFrames.length)) this.changed(this.multiple ? [] : null);
        else this.modal.open();
    }
}
