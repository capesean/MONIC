import { Component as NgComponent, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { EChartsOption } from 'echarts/types/dist/shared';
import { Datum } from '../models/datum.model';
import { Indicator } from '../models/indicator.model';
import { AppDate } from '../models/date.model';
import { IndicatorBarChartSettings, Widget } from '../models/widget.model';
import { UtilitiesService } from '../services/utilities.service';
import { WidgetService } from '../services/widget.service';

@NgComponent({
    selector: 'app-indicator-bar-chart',
    templateUrl: './indicator.barchart.component.html',
    standalone: false
})
export class IndicatorBarChartComponent implements OnInit, Widget {

    @Output() loading: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() error: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() title: EventEmitter<string> = new EventEmitter<string>(true);
    @Output() subtitle: EventEmitter<string> = new EventEmitter<string>();

    private _settings: IndicatorBarChartSettings;
    @Input() set settings(s: IndicatorBarChartSettings) {
        if (!s) return;
        this._settings = s;
        this.load();
    }

    public chartOptions: EChartsOption;

    public indicator: Indicator;
    public date: AppDate;
    public data: Datum[];

    constructor(
        private utilitiesService: UtilitiesService,
        private widgetService: WidgetService
    ) {
    }

    ngOnInit(): void {
    }

    public load(): void {
        if (!this._settings.indicatorId || !this._settings.dateId) {
            this.loading.emit(false);
            this.error.emit(true);
            return;
        }

        this.widgetService.load2(this._settings.indicatorId, this._settings.entityTypeId, this._settings.dateId)
            .subscribe({
                next: response => {

                    this.indicator = response.indicator;
                    this.date = response.date;
                    this.data = response.data;

                    this.title.emit(this.indicator.name);
                    this.subtitle.emit(this.date.name);

                    this.indicator.entityType = response.entityType;
                    this.data.forEach(datum => {
                        datum.entity = response.entities.find(o => o.entityId === datum.entityId);
                        datum.date = this.date;
                    });

                    response.data.sort((a, b) => a.date.code < b.date.code ? -1 : 1);

                    const xCategories: string[] = [];
                    const values: number[] = [];
                    const formatter = this.utilitiesService.getFormatter(response.indicator);

                    response.data.forEach(datum => {
                        xCategories.push(datum.entity.code);
                        values.push(datum.value);
                    });

                    this.chartOptions = {
                        grid: {
                            left: 50,
                            right: 10,
                            top: 10,
                            bottom: 50
                        },
                        xAxis: {
                            type: 'category',
                            data: xCategories,
                            axisLabel: {
                                fontSize: 8,
                                rotate: 90,

                            }
                        },
                        yAxis: {
                            type: 'value',
                            axisLabel: {
                                formatter: formatter,
                                fontSize: 8
                            },

                        },
                        series: [{
                            name: `${response.indicator.code}: ${response.date.code}`,
                            type: "bar",
                            data: values,
                            colorBy: "data"
                        }],
                        tooltip: {
                            trigger: 'axis',
                            textStyle: {
                                fontSize: 10
                            },
                            axisPointer: {
                                type: 'cross',
                                crossStyle: {
                                    color: 'red'
                                },
                                label: {
                                    formatter: formatter
                                }
                            },
                            valueFormatter: formatter
                        }
                    } as EChartsOption;

                    this.error.emit(false);
                    this.loading.emit(false);

                },
                error: err => {
                    this.loading.emit(false);
                    this.error.emit(true);                }
            });
    }
}
