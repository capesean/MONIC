import { Component as NgComponent, OnInit, forwardRef, ViewChild, Input, EventEmitter, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MilestoneModalComponent } from './milestone.modal.component';
import { Milestone } from '../../common/models/milestone.model';
import { Enum } from '../../common/models/enums.model';
import { Project } from '../../common/models/project.model';

@NgComponent({
    selector: 'milestone-select',
    templateUrl: './milestone.select.component.html',
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => MilestoneSelectComponent),
        multi: true
    }],
    host: { 'class': 'app-select' }
})
export class MilestoneSelectComponent implements OnInit, ControlValueAccessor {

    @Input() milestone: Milestone;
    @Input() milestones: Milestone[] = [];
    @Output() milestoneChange = new EventEmitter<Milestone>();
    @Output() milestonesChange = new EventEmitter<Milestone[]>();
    @Input() canRemoveFilters = false;
    @Input() multiple = false;
    @Input() showAddNew = false;
    @Input() project: Project;

    disabled = false;
    placeholder = this.multiple ? "Select milestones" : "Select a milestone";

    @ViewChild('modal') modal: MilestoneModalComponent;

    constructor(
    ) {
    }

    ngOnInit(): void {
    }

    propagateChange = (_: any) => { };

    writeValue(milestoneId: string | string[]): void {
        if (milestoneId !== undefined) {
            this.propagateChange(milestoneId);
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

    changed(milestone: Milestone | Milestone[]) {
        if (this.disabled) return;
        if (this.multiple) {
            this.writeValue(milestone ? (milestone as Milestone[]).map(o => o.milestoneId) : null);
            this.milestones = (milestone as Milestone[]);
            this.milestonesChange.emit((milestone as Milestone[]));
        } else {
            this.writeValue(milestone ? (milestone as Milestone).milestoneId : null);
            this.milestone = (milestone as Milestone);
            this.milestoneChange.emit((milestone as Milestone));
        }
    }

    getLabel() {
        return this.multiple ? this.milestones.map(milestone => milestone.name).join(", ") : this.milestone?.name ?? "";
    }

    click(button = false) {
        if (this.disabled) return;
        // clear the selector if there is something there already
        if (button && (this.milestone || this.milestones.length)) this.changed(this.multiple ? [] : null);
        else this.modal.open();
    }

    clear() {
        this.changed(this.multiple ? [] : null);
    }
}

