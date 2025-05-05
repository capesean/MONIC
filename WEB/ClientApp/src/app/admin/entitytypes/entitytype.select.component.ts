import { Component as NgComponent, OnInit, forwardRef, ViewChild, Input, EventEmitter, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { EntityTypeModalComponent } from './entitytype.modal.component';
import { EntityType } from '../../common/models/entitytype.model';
import { Enum } from '../../common/models/enums.model';

@NgComponent({
    selector: 'entity-type-select',
    templateUrl: './entitytype.select.component.html',
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => EntityTypeSelectComponent),
        multi: true
    }],
    host: { 'class': 'app-select' },
    standalone: false
})
export class EntityTypeSelectComponent implements OnInit, ControlValueAccessor {

    @Input() entityType: EntityType;
    @Input() entityTypes: EntityType[] = [];
    @Output() entityTypeChange = new EventEmitter<EntityType>();
    @Output() entityTypesChange = new EventEmitter<EntityType[]>();
    @Input() canRemoveFilters = false;
    @Input() multiple = false;
    @Input() showAddNew = false;

    disabled = false;
    placeholder = this.multiple ? "Select entity types" : "Select an entity type";

    @ViewChild('modal') modal: EntityTypeModalComponent;

    constructor(
    ) {
    }

    ngOnInit(): void {
    }

    propagateChange = (_: any) => { };

    writeValue(entityTypeId: string | string[]): void {
        if (entityTypeId !== undefined) {
            this.propagateChange(entityTypeId);
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

    changed(entityType: EntityType | EntityType[]) {
        if (this.disabled) return;
        if (this.multiple) {
            this.writeValue(entityType ? (entityType as EntityType[]).map(o => o.entityTypeId) : null);
            this.entityTypes = (entityType as EntityType[]);
            this.entityTypesChange.emit((entityType as EntityType[]));
        } else {
            this.writeValue(entityType ? (entityType as EntityType).entityTypeId : null);
            this.entityType = (entityType as EntityType);
            this.entityTypeChange.emit((entityType as EntityType));
        }
    }

    getLabel() {
        return this.multiple ? this.entityTypes.map(entityType => entityType.name).join(", ") : this.entityType?.name ?? "";
    }

    click(button = false) {
        if (this.disabled) return;
        // clear the selector if there is something there already
        if (button && (this.entityType || this.entityTypes.length)) this.changed(this.multiple ? [] : null);
        else this.modal.open();
    }

    clear() {
        this.changed(this.multiple ? [] : null);
    }
}

