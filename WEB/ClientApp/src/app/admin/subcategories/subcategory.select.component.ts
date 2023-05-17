import { Component as NgComponent, OnInit, forwardRef, ViewChild, Input, EventEmitter, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { SubcategoryModalComponent } from './subcategory.modal.component';
import { Subcategory } from '../../common/models/subcategory.model';
import { Enum } from '../../common/models/enums.model';
import { Category } from '../../common/models/category.model';

@NgComponent({
    selector: 'subcategory-select',
    templateUrl: './subcategory.select.component.html',
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => SubcategorySelectComponent),
        multi: true
    }],
    host: { 'class': 'app-select' }
})
export class SubcategorySelectComponent implements OnInit, ControlValueAccessor {

    @Input() subcategory: Subcategory;
    @Input() subcategories: Subcategory[] = [];
    @Output() subcategoryChange = new EventEmitter<Subcategory>();
    @Output() subcategoriesChange = new EventEmitter<Subcategory[]>();
    @Input() canRemoveFilters = false;
    @Input() multiple = false;
    @Input() showAddNew = false;
    @Input() category: Category;

    disabled = false;
    placeholder = this.multiple ? "Select subcategories" : "Select a subcategory";

    @ViewChild('modal') modal: SubcategoryModalComponent;

    constructor(
    ) {
    }

    ngOnInit(): void {
    }

    propagateChange = (_: any) => { };

    writeValue(subcategoryId: string | string[]): void {
        if (subcategoryId !== undefined) {
            this.propagateChange(subcategoryId);
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

    changed(subcategory: Subcategory | Subcategory[]) {
        if (this.disabled) return;
        if (this.multiple) {
            this.writeValue(subcategory ? (subcategory as Subcategory[]).map(o => o.subcategoryId) : null);
            this.subcategories = (subcategory as Subcategory[]);
            this.subcategoriesChange.emit((subcategory as Subcategory[]));
        } else {
            this.writeValue(subcategory ? (subcategory as Subcategory).subcategoryId : null);
            this.subcategory = (subcategory as Subcategory);
            this.subcategoryChange.emit((subcategory as Subcategory));
        }
    }

    getLabel() {
        return this.multiple ? this.subcategories.map(subcategory => subcategory.name).join(", ") : this.subcategory?.name ?? "";
    }

    click(button = false) {
        if (this.disabled) return;
        if (button && (this.subcategory || this.subcategories)) this.changed(this.multiple ? [] : null);
        else this.modal.open();
    }
}
