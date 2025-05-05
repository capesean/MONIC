import { Component as NgComponent, OnInit, forwardRef, ViewChild, Input, EventEmitter, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { QuestionOptionGroupModalComponent } from './questionoptiongroup.modal.component';
import { QuestionOptionGroup } from '../../common/models/questionoptiongroup.model';
import { Enum } from '../../common/models/enums.model';

@NgComponent({
    selector: 'question-option-group-select',
    templateUrl: './questionoptiongroup.select.component.html',
    providers: [{
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => QuestionOptionGroupSelectComponent),
            multi: true
        }],
    host: { 'class': 'app-select' },
    standalone: false
})
export class QuestionOptionGroupSelectComponent implements OnInit, ControlValueAccessor {

    @Input() questionOptionGroup: QuestionOptionGroup;
    @Input() questionOptionGroups: QuestionOptionGroup[] = [];
    @Output() questionOptionGroupChange = new EventEmitter<QuestionOptionGroup>();
    @Output() questionOptionGroupsChange = new EventEmitter<QuestionOptionGroup[]>();
    @Input() canRemoveFilters = false;
    @Input() multiple = false;
    @Input() showAddNew = false;
    @Input() shared: boolean;

    disabled = false;
    placeholder = this.multiple ? "Select question option groups" : "Select a question option group";

    @ViewChild('modal') modal: QuestionOptionGroupModalComponent;

    constructor(
    ) {
    }

    ngOnInit(): void {
    }

    propagateChange = (_: any) => { };

    writeValue(questionOptionGroupId: string | string[]): void {
        if (questionOptionGroupId !== undefined) {
            this.propagateChange(questionOptionGroupId);
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

    changed(questionOptionGroup: QuestionOptionGroup | QuestionOptionGroup[]) {
        if (this.disabled) return;
        if (this.multiple) {
            this.writeValue(questionOptionGroup ? (questionOptionGroup as QuestionOptionGroup[]).map(o => o.questionOptionGroupId) : null);
            this.questionOptionGroups = (questionOptionGroup as QuestionOptionGroup[]);
            this.questionOptionGroupsChange.emit((questionOptionGroup as QuestionOptionGroup[]));
        } else {
            this.writeValue(questionOptionGroup ? (questionOptionGroup as QuestionOptionGroup).questionOptionGroupId : null);
            this.questionOptionGroup = (questionOptionGroup as QuestionOptionGroup);
            this.questionOptionGroupChange.emit((questionOptionGroup as QuestionOptionGroup));
        }
    }

    getLabel() {
        return this.multiple ? this.questionOptionGroups.map(questionOptionGroup => questionOptionGroup.name).join(", ") : this.questionOptionGroup?.name ?? "";
    }

    click(button = false) {
        if (this.disabled) return;
        // clear the selector if there is something there already
        if (button && (this.questionOptionGroup || this.questionOptionGroups.length)) this.changed(this.multiple ? [] : null);
        else this.modal.open();
    }

    clear() {
        this.changed(this.multiple ? [] : null);
    }
}

