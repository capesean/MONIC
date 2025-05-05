import { Component as NgComponent, OnInit, forwardRef, ViewChild, Input, EventEmitter, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ComponentModalComponent } from './component.modal.component';
import { Component } from '../../common/models/component.model';
import { Enum } from '../../common/models/enums.model';

@NgComponent({
    selector: 'component-select',
    templateUrl: './component.select.component.html',
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => ComponentSelectComponent),
        multi: true
    }],
    host: { 'class': 'app-select' },
    standalone: false
})
export class ComponentSelectComponent implements OnInit, ControlValueAccessor {

    @Input() component: Component;
    @Input() components: Component[] = [];
    @Output() componentChange = new EventEmitter<Component>();
    @Output() componentsChange = new EventEmitter<Component[]>();
    @Input() canRemoveFilters = false;
    @Input() multiple = false;
    @Input() showAddNew = false;
    @Input() componentType: Enum;

    disabled = false;
    placeholder = this.multiple ? "Select components" : "Select a component";

    @ViewChild('modal') modal: ComponentModalComponent;

    constructor(
    ) {
    }

    ngOnInit(): void {
    }

    propagateChange = (_: any) => { };

    writeValue(componentId: string | string[]): void {
        if (componentId !== undefined) {
            this.propagateChange(componentId);
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

    changed(component: Component | Component[]) {
        if (this.disabled) return;
        if (this.multiple) {
            this.writeValue(component ? (component as Component[]).map(o => o.componentId) : null);
            this.components = (component as Component[]);
            this.componentsChange.emit((component as Component[]));
        } else {
            this.writeValue(component ? (component as Component).componentId : null);
            this.component = (component as Component);
            this.componentChange.emit((component as Component));
        }
    }

    getLabel() {
        return this.multiple ? this.components.map(component => component.name).join(", ") : this.component?.name ?? "";
    }

    click(button = false) {
        if (this.disabled) return;
        // clear the selector if there is something there already
        if (button && (this.component || this.components.length)) this.changed(this.multiple ? [] : null);
        else this.modal.open();
    }

    clear() {
        this.changed(this.multiple ? [] : null);
    }
}

