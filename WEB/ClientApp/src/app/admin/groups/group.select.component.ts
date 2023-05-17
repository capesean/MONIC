import { Component as NgComponent, OnInit, forwardRef, ViewChild, Input, EventEmitter, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { GroupModalComponent } from './group.modal.component';
import { Group } from '../../common/models/group.model';
import { Enum } from '../../common/models/enums.model';

@NgComponent({
    selector: 'group-select',
    templateUrl: './group.select.component.html',
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => GroupSelectComponent),
        multi: true
    }],
    host: { 'class': 'app-select' }
})
export class GroupSelectComponent implements OnInit, ControlValueAccessor {

    @Input() group: Group;
    @Input() groups: Group[] = [];
    @Output() groupChange = new EventEmitter<Group>();
    @Output() groupsChange = new EventEmitter<Group[]>();
    @Input() canRemoveFilters = false;
    @Input() multiple = false;
    @Input() showAddNew = false;

    disabled = false;
    placeholder = this.multiple ? "Select groups" : "Select a group";

    @ViewChild('modal') modal: GroupModalComponent;

    constructor(
    ) {
    }

    ngOnInit(): void {
    }

    propagateChange = (_: any) => { };

    writeValue(groupId: string | string[]): void {
        if (groupId !== undefined) {
            this.propagateChange(groupId);
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

    changed(group: Group | Group[]) {
        if (this.disabled) return;
        if (this.multiple) {
            this.writeValue(group ? (group as Group[]).map(o => o.groupId) : null);
            this.groups = (group as Group[]);
            this.groupsChange.emit((group as Group[]));
        } else {
            this.writeValue(group ? (group as Group).groupId : null);
            this.group = (group as Group);
            this.groupChange.emit((group as Group));
        }
    }

    getLabel() {
        return this.multiple ? this.groups.map(group => group.name).join(", ") : this.group?.name ?? "";
    }

    click(button = false) {
        if (this.disabled) return;
        if (button && (this.group || this.groups)) this.changed(this.multiple ? [] : null);
        else this.modal.open();
    }
}
