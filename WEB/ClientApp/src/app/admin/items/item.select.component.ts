import { Component as NgComponent, OnInit, forwardRef, ViewChild, Input, EventEmitter, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ItemModalComponent } from './item.modal.component';
import { Item } from '../../common/models/item.model';
import { Enum } from '../../common/models/enums.model';

@NgComponent({
    selector: 'item-select',
    templateUrl: './item.select.component.html',
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => ItemSelectComponent),
        multi: true
    }],
    host: { 'class': 'app-select' },
    standalone: false
})
export class ItemSelectComponent implements OnInit, ControlValueAccessor {

    @Input() item: Item;
    @Input() items: Item[] = [];
    @Output() itemChange = new EventEmitter<Item>();
    @Output() itemsChange = new EventEmitter<Item[]>();
    @Input() canRemoveFilters = false;
    @Input() multiple = false;
    @Input() showAddNew = false;
    @Input() itemType: Enum;

    disabled = false;
    placeholder = this.multiple ? "Select items" : "Select an item";

    @ViewChild('modal') modal: ItemModalComponent;

    constructor(
    ) {
    }

    ngOnInit(): void {
    }

    propagateChange = (_: any) => { };

    writeValue(itemId: string | string[]): void {
        if (itemId !== undefined) {
            this.propagateChange(itemId);
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

    changed(item: Item | Item[]) {
        if (this.disabled) return;
        if (this.multiple) {
            this.writeValue(item ? (item as Item[]).map(o => o.itemId) : null);
            this.items = (item as Item[]);
            this.itemsChange.emit((item as Item[]));
        } else {
            this.writeValue(item ? (item as Item).itemId : null);
            this.item = (item as Item);
            this.itemChange.emit((item as Item));
        }
    }

    getLabel() {
        return this.multiple ? this.items.map(item => item.itemId).join(", ") : this.item?.itemId ?? "";
    }

    click(button = false) {
        if (this.disabled) return;
        // clear the selector if there is something there already
        if (button && (this.item || this.items.length)) this.changed(this.multiple ? [] : null);
        else this.modal.open();
    }

    clear() {
        this.changed(this.multiple ? [] : null);
    }
}

