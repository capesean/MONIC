import { Component as NgComponent, EventEmitter, Input, OnInit, Output } from '@angular/core';
import * as d3 from 'd3';
import { EChartsOption } from 'echarts';
import { forkJoin } from 'rxjs';
import { Datum, DatumSearchOptions } from '../models/datum.model';
import { Indicator } from '../models/indicator.model';
import { DateService } from '../services/date.service';
import { Date } from '../models/date.model';
import { DatumService } from '../services/datum.service';
import { IndicatorService } from '../services/indicator.service';
import { IndicatorBarChartSettings, Widget } from '../models/widget.model';
import { UtilitiesService } from '../services/utilities.service';

@NgComponent({
    selector: 'app-indicator-bar-chart',
    templateUrl: './indicator.barchart.component.html'
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
    public date: Date;
    public data: Datum[];

    constructor(
        private datumService: DatumService,
        private indicatorService: IndicatorService,
        private dateService: DateService,
        private utilitiesService: UtilitiesService
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

        forkJoin({
            data: this.datumService.search({
                pageSize: 0, // todo: how to handle lots of data?
                includeParents: true,
                indicatorId: this._settings.indicatorId,
                dateId: this._settings.dateId
            } as DatumSearchOptions),
            indicator: this.indicatorService.get(this._settings.indicatorId),
            date: this.dateService.get(this._settings.dateId)
        }).subscribe({
            next: response => {

                this.indicator = response.indicator;
                this.date = response.date;

                this.title.emit(response.indicator.name);
                this.subtitle.emit(response.date.name);

                response.data.data.sort((a, b) => a.date.sortOrder - b.date.sortOrder);
                this.data = response.data.data;

                const xCategories: string[] = [];
                const values: number[] = [];
                const formatter = this.utilitiesService.getFormatter(response.indicator);

                response.data.data.forEach(datum => {
                    xCategories.push(datum.entity.code);
                    values.push(datum.value);
                });

                this.chartOptions = {
                    grid: {
                        left: 40,
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
                        triggerOn: "click",
                        alwaysShowContent: false,
                        textStyle: {
                            fontSize: 10
                        },
                        valueFormatter: formatter
                    }
                } as EChartsOption;

                this.error.emit(false);
                this.loading.emit(false);
            },
            error: () => {
                this.loading.emit(false);
                this.error.emit(true);
            }
        });
    }
}
