import { Component as NgComponent, OnInit, forwardRef, ViewChild, Input, EventEmitter, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { AnswerModalComponent } from './answer.modal.component';
import { Answer } from '../../common/models/answer.model';
import { Enum } from '../../common/models/enums.model';
import { Response } from '../../common/models/response.model';
import { Question } from '../../common/models/question.model';

@NgComponent({
    selector: 'answer-select',
    templateUrl: './answer.select.component.html',
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => AnswerSelectComponent),
        multi: true
    }],
    host: { 'class': 'app-select' }
})
export class AnswerSelectComponent implements OnInit, ControlValueAccessor {

    @Input() answer: Answer;
    @Input() answers: Answer[] = [];
    @Output() answerChange = new EventEmitter<Answer>();
    @Output() answersChange = new EventEmitter<Answer[]>();
    @Input() canRemoveFilters = false;
    @Input() multiple = false;
    @Input() showAddNew = false;
    @Input() response: Response;
    @Input() question: Question;

    disabled = false;
    placeholder = this.multiple ? "Select answers" : "Select an answer";

    @ViewChild('modal') modal: AnswerModalComponent;

    constructor(
    ) {
    }

    ngOnInit(): void {
    }

    propagateChange = (_: any) => { };

    writeValue(answerId: string | string[]): void {
        if (answerId !== undefined) {
            this.propagateChange(answerId);
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

    changed(answer: Answer | Answer[]) {
        if (this.disabled) return;
        if (this.multiple) {
            this.writeValue(answer ? (answer as Answer[]).map(o => o.answerId) : null);
            this.answers = (answer as Answer[]);
            this.answersChange.emit((answer as Answer[]));
        } else {
            this.writeValue(answer ? (answer as Answer).answerId : null);
            this.answer = (answer as Answer);
            this.answerChange.emit((answer as Answer));
        }
    }

    getLabel() {
        return this.multiple ? this.answers.map(answer => answer.questionId).join(", ") : this.answer?.questionId ?? "";
    }

    click(button = false) {
        if (this.disabled) return;
        // clear the selector if there is something there already
        if (button && (this.answer || this.answers.length)) this.changed(this.multiple ? [] : null);
        else this.modal.open();
    }

    clear() {
        this.changed(this.multiple ? [] : null);
    }
}

