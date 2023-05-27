import { Component as NgComponent, OnInit, forwardRef, ViewChild, Input, EventEmitter, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { SectionModalComponent } from './section.modal.component';
import { Section } from '../../common/models/section.model';
import { Enum } from '../../common/models/enums.model';
import { Questionnaire } from '../../common/models/questionnaire.model';

@NgComponent({
    selector: 'section-select',
    templateUrl: './section.select.component.html',
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => SectionSelectComponent),
        multi: true
    }],
    host: { 'class': 'app-select' }
})
export class SectionSelectComponent implements OnInit, ControlValueAccessor {

    @Input() section: Section;
    @Input() sections: Section[] = [];
    @Output() sectionChange = new EventEmitter<Section>();
    @Output() sectionsChange = new EventEmitter<Section[]>();
    @Input() canRemoveFilters = false;
    @Input() multiple = false;
    @Input() showAddNew = false;
    @Input() questionnaire: Questionnaire;

    disabled = false;
    placeholder = this.multiple ? "Select sections" : "Select a section";

    @ViewChild('modal') modal: SectionModalComponent;

    constructor(
    ) {
    }

    ngOnInit(): void {
    }

    propagateChange = (_: any) => { };

    writeValue(sectionId: string | string[]): void {
        if (sectionId !== undefined) {
            this.propagateChange(sectionId);
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

    changed(section: Section | Section[]) {
        if (this.disabled) return;
        if (this.multiple) {
            this.writeValue(section ? (section as Section[]).map(o => o.sectionId) : null);
            this.sections = (section as Section[]);
            this.sectionsChange.emit((section as Section[]));
        } else {
            this.writeValue(section ? (section as Section).sectionId : null);
            this.section = (section as Section);
            this.sectionChange.emit((section as Section));
        }
    }

    getLabel() {
        return this.multiple ? this.sections.map(section => section.name).join(", ") : this.section?.name ?? "";
    }

    click(button = false) {
        if (this.disabled) return;
        // clear the selector if there is something there already
        if (button && (this.section || this.sections.length)) this.changed(this.multiple ? [] : null);
        else this.modal.open();
    }
}
