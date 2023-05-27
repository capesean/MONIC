import { Component as NgComponent, OnInit, forwardRef, ViewChild, Input, EventEmitter, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { RelationshipModalComponent } from './relationship.modal.component';
import { Relationship } from '../../common/models/relationship.model';
import { Enum } from '../../common/models/enums.model';
import { TheoryOfChange } from '../../common/models/theoryofchange.model';
import { Component } from '../../common/models/component.model';

@NgComponent({
    selector: 'relationship-select',
    templateUrl: './relationship.select.component.html',
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => RelationshipSelectComponent),
        multi: true
    }],
    host: { 'class': 'app-select' }
})
export class RelationshipSelectComponent implements OnInit, ControlValueAccessor {

    @Input() relationship: Relationship;
    @Input() relationships: Relationship[] = [];
    @Output() relationshipChange = new EventEmitter<Relationship>();
    @Output() relationshipsChange = new EventEmitter<Relationship[]>();
    @Input() canRemoveFilters = false;
    @Input() multiple = false;
    @Input() showAddNew = false;
    @Input() theoryOfChange: TheoryOfChange;
    @Input() sourceComponent: Component;
    @Input() targetComponent: Component;

    disabled = false;
    placeholder = this.multiple ? "Select relationships" : "Select a relationship";

    @ViewChild('modal') modal: RelationshipModalComponent;

    constructor(
    ) {
    }

    ngOnInit(): void {
    }

    propagateChange = (_: any) => { };

    writeValue(relationshipId: string | string[]): void {
        if (relationshipId !== undefined) {
            this.propagateChange(relationshipId);
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

    changed(relationship: Relationship | Relationship[]) {
        if (this.disabled) return;
        if (this.multiple) {
            this.writeValue(relationship ? (relationship as Relationship[]).map(o => o.relationshipId) : null);
            this.relationships = (relationship as Relationship[]);
            this.relationshipsChange.emit((relationship as Relationship[]));
        } else {
            this.writeValue(relationship ? (relationship as Relationship).relationshipId : null);
            this.relationship = (relationship as Relationship);
            this.relationshipChange.emit((relationship as Relationship));
        }
    }

    getLabel() {
        return this.multiple ? this.relationships.map(relationship => relationship.targetComponentId).join(", ") : this.relationship?.targetComponentId ?? "";
    }

    click(button = false) {
        if (this.disabled) return;
        // clear the selector if there is something there already
        if (button && (this.relationship || this.relationships.length)) this.changed(this.multiple ? [] : null);
        else this.modal.open();
    }
}
