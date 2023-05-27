import { Component as NgComponent, OnInit, forwardRef, ViewChild, Input, EventEmitter, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { EntityModalComponent } from './entity.modal.component';
import { Entity } from '../../common/models/entity.model';
import { Roles } from '../../common/models/enums.model';
import { EntityType } from '../../common/models/entitytype.model';
import { Organisation } from '../../common/models/organisation.model';

@NgComponent({
    selector: 'entity-select',
    templateUrl: './entity.select.component.html',
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => EntitySelectComponent),
        multi: true
    }],
    host: { 'class': 'app-select' }
})
export class EntitySelectComponent implements OnInit, ControlValueAccessor {

    @Input() entity: Entity;
    @Input() entities: Entity[] = [];
    @Output() entityChange = new EventEmitter<Entity>();
    @Output() entitiesChange = new EventEmitter<Entity[]>();
    @Input() canRemoveFilters = false;
    @Input() multiple = false;
    @Input() showAddNew = false;
    @Input() entityType: EntityType;
    @Input() permission: string;
    @Input() role: Roles;
    @Input() organisation: Organisation;
    @Input() placeholder: string;

    disabled = false;

    @ViewChild('modal') modal: EntityModalComponent;

    constructor(
    ) {
        this.placeholder = this.placeholder || this.multiple ? "Select entities" : "Select an entity";
    }

    ngOnInit(): void {
    }

    propagateChange = (_: any) => { };

    writeValue(entityId: string | string[]): void {
        if (entityId !== undefined) {
            this.propagateChange(entityId);
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

    changed(entity: Entity | Entity[]) {
        if (this.disabled) return;
        if (this.multiple) {
            this.writeValue(entity ? (entity as Entity[]).map(o => o.entityId) : null);
            this.entities = (entity as Entity[]);
            this.entitiesChange.emit((entity as Entity[]));
        } else {
            this.writeValue(entity ? (entity as Entity).entityId : null);
            this.entity = (entity as Entity);
            this.entityChange.emit((entity as Entity));
        }
    }

    getLabel() {
        return this.multiple ? this.entities.map(entity => entity.name).join(", ") : this.entity?.name ?? "";
    }

    click(button = false) {
        if (this.disabled) return;
        // clear the selector if there is something there already
        if (button && (this.entity || this.entities.length)) this.changed(this.multiple ? [] : null);
        else this.modal.open();
    }
}
