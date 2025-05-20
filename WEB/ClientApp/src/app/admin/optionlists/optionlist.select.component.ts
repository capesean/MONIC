import { Component as NgComponent, OnInit, forwardRef, ViewChild, Input, EventEmitter, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { OptionListModalComponent } from './optionlist.modal.component';
import { OptionList } from '../../common/models/optionlist.model';
import { Enum } from '../../common/models/enums.model';

@NgComponent({
    selector: 'option-list-select',
    templateUrl: './optionlist.select.component.html',
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => OptionListSelectComponent),
        multi: true
    }],
    host: { 'class': 'app-select' },
    standalone: false
})
export class OptionListSelectComponent implements OnInit, ControlValueAccessor {

    @Input() optionList: OptionList;
    @Input() optionLists: OptionList[] = [];
    @Output() optionListChange = new EventEmitter<OptionList>();
    @Output() optionListsChange = new EventEmitter<OptionList[]>();
    @Input() canRemoveFilters = false;
    @Input() multiple = false;
    @Input() showAddNew = false;

    disabled = false;
    placeholder = this.multiple ? "Select option lists" : "Select an option list";

    @ViewChild('modal') modal: OptionListModalComponent;

    constructor(
    ) {
    }

    ngOnInit(): void {
    }

    propagateChange = (_: any) => { };

    writeValue(optionListId: string | string[]): void {
        if (optionListId !== undefined) {
            this.propagateChange(optionListId);
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

    changed(optionList: OptionList | OptionList[]) {
        if (this.disabled) return;
        if (this.multiple) {
            this.writeValue(optionList ? (optionList as OptionList[]).map(o => o.optionListId) : null);
            this.optionLists = (optionList as OptionList[]);
            this.optionListsChange.emit((optionList as OptionList[]));
        } else {
            this.writeValue(optionList ? (optionList as OptionList).optionListId : null);
            this.optionList = (optionList as OptionList);
            this.optionListChange.emit((optionList as OptionList));
        }
    }

    getLabel() {
        return this.multiple ? this.optionLists.map(optionList => optionList.name).join(", ") : this.optionList?.name ?? "";
    }

    click(button = false) {
        if (this.disabled) return;
        // clear the selector if there is something there already
        if (button && (this.optionList || this.optionLists.length)) this.changed(this.multiple ? [] : null);
        else this.modal.open();
    }

    clear() {
        this.changed(this.multiple ? [] : null);
    }
}

