import { Component as NgComponent, OnInit, forwardRef, ViewChild, Input, EventEmitter, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { QuestionOptionModalComponent } from './questionoption.modal.component';
import { QuestionOption } from '../../common/models/questionoption.model';
import { Enum } from '../../common/models/enums.model';
import { QuestionOptionGroup } from '../../common/models/questionoptiongroup.model';

@NgComponent({
    selector: 'question-option-select',
    templateUrl: './questionoption.select.component.html',
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => QuestionOptionSelectComponent),
        multi: true
    }],
    host: { 'class': 'app-select' }
})
export class QuestionOptionSelectComponent implements OnInit, ControlValueAccessor {

    @Input() questionOption: QuestionOption;
    @Input() questionOptions: QuestionOption[] = [];
    @Output() questionOptionChange = new EventEmitter<QuestionOption>();
    @Output() questionOptionsChange = new EventEmitter<QuestionOption[]>();
    @Input() canRemoveFilters = false;
    @Input() multiple = false;
    @Input() showAddNew = false;
    @Input() questionOptionGroup: QuestionOptionGroup;

    disabled = false;
    placeholder = this.multiple ? "Select options" : "Select a option";

    @ViewChild('modal') modal: QuestionOptionModalComponent;

    constructor(
    ) {
    }

    ngOnInit(): void {
    }

    propagateChange = (_: any) => { };

    writeValue(questionOptionId: string | string[]): void {
        if (questionOptionId !== undefined) {
            this.propagateChange(questionOptionId);
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

    changed(questionOption: QuestionOption | QuestionOption[]) {
        if (this.disabled) return;
        if (this.multiple) {
            this.writeValue(questionOption ? (questionOption as QuestionOption[]).map(o => o.questionOptionId) : null);
            this.questionOptions = (questionOption as QuestionOption[]);
            this.questionOptionsChange.emit((questionOption as QuestionOption[]));
        } else {
            this.writeValue(questionOption ? (questionOption as QuestionOption).questionOptionId : null);
            this.questionOption = (questionOption as QuestionOption);
            this.questionOptionChange.emit((questionOption as QuestionOption));
        }
    }

    getLabel() {
        return this.multiple ? this.questionOptions.map(questionOption => questionOption.label).join(", ") : this.questionOption?.label ?? "";
    }

    click(button = false) {
        if (this.disabled) return;
        // clear the selector if there is something there already
        if (button && (this.questionOption || this.questionOptions.length)) this.changed(this.multiple ? [] : null);
        else this.modal.open();
    }

    clear() {
        this.changed(this.multiple ? [] : null);
    }
}

