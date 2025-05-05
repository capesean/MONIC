import { Component as NgComponent, OnInit, forwardRef, ViewChild, Input, EventEmitter, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ResponseModalComponent } from './response.modal.component';
import { Response } from '../../common/models/response.model';
import { Enum } from '../../common/models/enums.model';
import { Questionnaire } from '../../common/models/questionnaire.model';
import { Entity } from '../../common/models/entity.model';
import { AppDate } from '../../common/models/date.model';

@NgComponent({
    selector: 'response-select',
    templateUrl: './response.select.component.html',
    providers: [{
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => ResponseSelectComponent),
            multi: true
        }],
    host: { 'class': 'app-select' },
    standalone: false
})
export class ResponseSelectComponent implements OnInit, ControlValueAccessor {

    @Input() response: Response;
    @Input() responses: Response[] = [];
    @Output() responseChange = new EventEmitter<Response>();
    @Output() responsesChange = new EventEmitter<Response[]>();
    @Input() canRemoveFilters = false;
    @Input() multiple = false;
    @Input() showAddNew = false;
    @Input() questionnaire: Questionnaire;
    @Input() entity: Entity;
    @Input() date: AppDate;

    disabled = false;
    placeholder = this.multiple ? "Select responses" : "Select a response";

    @ViewChild('modal') modal: ResponseModalComponent;

    constructor(
    ) {
    }

    ngOnInit(): void {
    }

    propagateChange = (_: any) => { };

    writeValue(responseId: string | string[]): void {
        if (responseId !== undefined) {
            this.propagateChange(responseId);
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

    changed(response: Response | Response[]) {
        if (this.disabled) return;
        if (this.multiple) {
            this.writeValue(response ? (response as Response[]).map(o => o.responseId) : null);
            this.responses = (response as Response[]);
            this.responsesChange.emit((response as Response[]));
        } else {
            this.writeValue(response ? (response as Response).responseId : null);
            this.response = (response as Response);
            this.responseChange.emit((response as Response));
        }
    }

    getLabel() {
        return this.multiple ? this.responses.map(response => response.questionnaireId).join(", ") : this.response?.questionnaireId ?? "";
    }

    click(button = false) {
        if (this.disabled) return;
        // clear the selector if there is something there already
        if (button && (this.response || this.responses.length)) this.changed(this.multiple ? [] : null);
        else this.modal.open();
    }

    clear() {
        this.changed(this.multiple ? [] : null);
    }
}

