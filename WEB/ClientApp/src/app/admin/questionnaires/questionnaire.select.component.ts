import { Component as NgComponent, OnInit, forwardRef, ViewChild, Input, EventEmitter, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { QuestionnaireModalComponent } from './questionnaire.modal.component';
import { Questionnaire } from '../../common/models/questionnaire.model';
import { Enum } from '../../common/models/enums.model';
import { EntityType } from '../../common/models/entitytype.model';

@NgComponent({
    selector: 'questionnaire-select',
    templateUrl: './questionnaire.select.component.html',
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => QuestionnaireSelectComponent),
        multi: true
    }],
    host: { 'class': 'app-select' }
})
export class QuestionnaireSelectComponent implements OnInit, ControlValueAccessor {

    @Input() questionnaire: Questionnaire;
    @Input() questionnaires: Questionnaire[] = [];
    @Output() questionnaireChange = new EventEmitter<Questionnaire>();
    @Output() questionnairesChange = new EventEmitter<Questionnaire[]>();
    @Input() canRemoveFilters = false;
    @Input() multiple = false;
    @Input() showAddNew = false;
    @Input() entityType: EntityType;
    @Input() dateType: Enum;

    disabled = false;
    placeholder = this.multiple ? "Select questionnaires" : "Select a questionnaire";

    @ViewChild('modal') modal: QuestionnaireModalComponent;

    constructor(
    ) {
    }

    ngOnInit(): void {
    }

    propagateChange = (_: any) => { };

    writeValue(questionnaireId: string | string[]): void {
        if (questionnaireId !== undefined) {
            this.propagateChange(questionnaireId);
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

    changed(questionnaire: Questionnaire | Questionnaire[]) {
        if (this.disabled) return;
        if (this.multiple) {
            this.writeValue(questionnaire ? (questionnaire as Questionnaire[]).map(o => o.questionnaireId) : null);
            this.questionnaires = (questionnaire as Questionnaire[]);
            this.questionnairesChange.emit((questionnaire as Questionnaire[]));
        } else {
            this.writeValue(questionnaire ? (questionnaire as Questionnaire).questionnaireId : null);
            this.questionnaire = (questionnaire as Questionnaire);
            this.questionnaireChange.emit((questionnaire as Questionnaire));
        }
    }

    getLabel() {
        return this.multiple ? this.questionnaires.map(questionnaire => questionnaire.name).join(", ") : this.questionnaire?.name ?? "";
    }

    click(button = false) {
        if (this.disabled) return;
        if (button && (this.questionnaire || this.questionnaires)) this.changed(this.multiple ? [] : null);
        else this.modal.open();
    }
}
