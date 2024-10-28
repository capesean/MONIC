import { Component as NgComponent, OnInit, forwardRef, ViewChild, Input, EventEmitter, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { QuestionModalComponent } from './question.modal.component';
import { Question } from '../../common/models/question.model';
import { Enum } from '../../common/models/enums.model';
import { Section } from '../../common/models/section.model';
import { QuestionOptionGroup } from '../../common/models/questionoptiongroup.model';
import { Questionnaire } from '../../common/models/questionnaire.model';

@NgComponent({
    selector: 'question-select',
    templateUrl: './question.select.component.html',
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => QuestionSelectComponent),
        multi: true
    }],
    host: { 'class': 'app-select' }
})
export class QuestionSelectComponent implements OnInit, ControlValueAccessor {

    @Input() question: Question;
    @Input() questions: Question[] = [];
    @Output() questionChange = new EventEmitter<Question>();
    @Output() questionsChange = new EventEmitter<Question[]>();
    @Input() canRemoveFilters = false;
    @Input() multiple = false;
    @Input() showAddNew = false;
    @Input() questionnaire: Questionnaire;
    @Input() section: Section;
    @Input() questionType: Enum;
    @Input() questionOptionGroup: QuestionOptionGroup;

    disabled = false;
    placeholder = this.multiple ? "Select questions" : "Select a question";

    @ViewChild('modal') modal: QuestionModalComponent;

    constructor(
    ) {
    }

    ngOnInit(): void {
    }

    propagateChange = (_: any) => { };

    writeValue(questionId: string | string[]): void {
        if (questionId !== undefined) {
            this.propagateChange(questionId);
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

    changed(question: Question | Question[]) {
        if (this.disabled) return;
        if (this.multiple) {
            this.writeValue(question ? (question as Question[]).map(o => o.questionId) : null);
            this.questions = (question as Question[]);
            this.questionsChange.emit((question as Question[]));
        } else {
            this.writeValue(question ? (question as Question).questionId : null);
            this.question = (question as Question);
            this.questionChange.emit((question as Question));
        }
    }

    getLabel() {
        return this.multiple ? this.questions.map(question => (question.code + ": " + question.text)).join(", ") : (this.question ? this.question.code + ": " + this.question.text : "");
    }

    click(button = false) {
        if (this.disabled) return;
        // clear the selector if there is something there already
        if (button && (this.question || this.questions.length)) this.changed(this.multiple ? [] : null);
        else this.modal.open();
    }

    clear() {
        this.changed(this.multiple ? [] : null);
    }
}

