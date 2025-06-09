import { Component as NgComponent, OnInit, forwardRef, ViewChild, Input, EventEmitter, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IndicatorModalComponent } from './indicator.modal.component';
import { Indicator } from '../../common/models/indicator.model';
import { Enum } from '../../common/models/enums.model';
import { Subcategory } from '../../common/models/subcategory.model';
import { EntityType } from '../../common/models/entitytype.model';
import { User } from '../../common/models/user.model';

@NgComponent({
    selector: 'indicator-select',
    templateUrl: './indicator.select.component.html',
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => IndicatorSelectComponent),
        multi: true
    }],
    host: { 'class': 'app-select' },
    standalone: false
})
export class IndicatorSelectComponent implements OnInit, ControlValueAccessor {

    @Input() indicator: Indicator;
    @Input() indicators: Indicator[] = [];
    @Output() indicatorChange = new EventEmitter<Indicator>();
    @Output() indicatorsChange = new EventEmitter<Indicator[]>();
    @Input() canRemoveFilters = false;
    @Input() multiple = false;
    @Input() showAddNew = false;
    @Input() subcategory: Subcategory;
    @Input() indicatorType: Enum;
    @Input() indicatorStatus: Enum;
    @Input() entityType: EntityType;
    @Input() frequency: Enum;
    @Input() groupingIndicator: Indicator;
    @Input() createdBy: User;

    disabled = false;
    placeholder = this.multiple ? "Select indicators" : "Select an indicator";

    @ViewChild('modal') modal: IndicatorModalComponent;

    constructor(
    ) {
    }

    ngOnInit(): void {
    }

    propagateChange = (_: any) => { };

    writeValue(indicatorId: string | string[]): void {
        if (indicatorId !== undefined) {
            this.propagateChange(indicatorId);
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

    changed(indicator: Indicator | Indicator[]) {
        if (this.disabled) return;
        if (this.multiple) {
            this.writeValue(indicator ? (indicator as Indicator[]).map(o => o.indicatorId) : null);
            this.indicators = (indicator as Indicator[]);
            this.indicatorsChange.emit((indicator as Indicator[]));
        } else {
            this.writeValue(indicator ? (indicator as Indicator).indicatorId : null);
            this.indicator = (indicator as Indicator);
            this.indicatorChange.emit((indicator as Indicator));
        }
    }

    getLabel() {
        return this.multiple ? this.indicators.map(indicator => indicator.name).join(", ") : this.indicator?.name ?? "";
    }

    click(button = false) {
        if (this.disabled) return;
        // clear the selector if there is something there already
        if (button && (this.indicator || this.indicators.length)) this.changed(this.multiple ? [] : null);
        else this.modal.open();
    }

    clear() {
        this.changed(this.multiple ? [] : null);
    }
}

