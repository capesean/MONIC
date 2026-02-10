import { Component as NgComponent, OnInit, forwardRef, ViewChild, Input, EventEmitter, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ChartModalComponent } from './chart.modal.component';
import { Chart } from '../../common/models/chart.model';
import { Enum } from '../../common/models/enums.model';

@NgComponent({
    selector: 'chart-select',
    templateUrl: './chart.select.component.html',
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => ChartSelectComponent),
        multi: true
    }],
    host: { 'class': 'app-select' },
    standalone: false
})
export class ChartSelectComponent implements OnInit, ControlValueAccessor {

    @Input() chart: Chart;
    @Input() charts: Chart[] = [];
    @Output() chartChange = new EventEmitter<Chart>();
    @Output() chartsChange = new EventEmitter<Chart[]>();
    @Input() canRemoveFilters = false;
    @Input() multiple = false;
    @Input() showAddNew = false;

    disabled = false;
    placeholder = this.multiple ? "Select charts" : "Select a chart";

    @ViewChild('modal') modal: ChartModalComponent;

    constructor(
    ) {
    }

    ngOnInit(): void {
    }

    propagateChange = (_: any) => { };

    writeValue(chartId: string | string[]): void {
        if (chartId !== undefined) {
            this.propagateChange(chartId);
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

    changed(chart: Chart | Chart[]) {
        if (this.disabled) return;
        if (this.multiple) {
            this.writeValue(chart ? (chart as Chart[]).map(o => o.chartId) : null);
            this.charts = (chart as Chart[]);
            this.chartsChange.emit((chart as Chart[]));
        } else {
            this.writeValue(chart ? (chart as Chart).chartId : null);
            this.chart = (chart as Chart);
            this.chartChange.emit((chart as Chart));
        }
    }

    getLabel() {
        return this.multiple ? this.charts.map(chart => chart.name).join(", ") : this.chart?.name ?? "";
    }

    click(button = false) {
        if (this.disabled) return;
        // clear the selector if there is something there already
        if (button && (this.chart || this.charts.length)) this.changed(this.multiple ? [] : null);
        else this.modal.open();
    }

    clear() {
        this.changed(this.multiple ? [] : null);
    }
}

