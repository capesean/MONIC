import { Component as NgComponent, OnInit, forwardRef, ViewChild, Input, EventEmitter, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CategoryModalComponent } from './category.modal.component';
import { Category } from '../../common/models/category.model';
import { Enum } from '../../common/models/enums.model';

@NgComponent({
    selector: 'category-select',
    templateUrl: './category.select.component.html',
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => CategorySelectComponent),
        multi: true
    }],
    host: { 'class': 'app-select' }
})
export class CategorySelectComponent implements OnInit, ControlValueAccessor {

    @Input() category: Category;
    @Input() categories: Category[] = [];
    @Output() categoryChange = new EventEmitter<Category>();
    @Output() categoriesChange = new EventEmitter<Category[]>();
    @Input() canRemoveFilters = false;
    @Input() multiple = false;
    @Input() showAddNew = false;

    disabled = false;
    placeholder = this.multiple ? "Select categories" : "Select a category";

    @ViewChild('modal') modal: CategoryModalComponent;

    constructor(
    ) {
    }

    ngOnInit(): void {
    }

    propagateChange = (_: any) => { };

    writeValue(categoryId: string | string[]): void {
        if (categoryId !== undefined) {
            this.propagateChange(categoryId);
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

    changed(category: Category | Category[]) {
        if (this.disabled) return;
        if (this.multiple) {
            this.writeValue(category ? (category as Category[]).map(o => o.categoryId) : null);
            this.categories = (category as Category[]);
            this.categoriesChange.emit((category as Category[]));
        } else {
            this.writeValue(category ? (category as Category).categoryId : null);
            this.category = (category as Category);
            this.categoryChange.emit((category as Category));
        }
    }

    getLabel() {
        return this.multiple ? this.categories.map(category => category.name).join(", ") : this.category?.name ?? "";
    }

    click(button = false) {
        if (this.disabled) return;
        if (button && (this.category || this.categories)) this.changed(this.multiple ? [] : null);
        else this.modal.open();
    }
}
