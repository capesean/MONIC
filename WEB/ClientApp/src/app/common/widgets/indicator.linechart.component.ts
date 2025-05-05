import { Component as NgComponent, EventEmitter, Input, OnInit, Output } from '@angular/core';
import * as d3 from 'd3';
import { EChartsOption } from 'echarts';
import { forkJoin } from 'rxjs';
import { Datum, DatumSearchOptions } from '../models/datum.model';
import { Entity } from '../models/entity.model';
import { Indicator } from '../models/indicator.model';
import { IndicatorLineChartSettings, Widget } from '../models/widget.model';
import { DatumService } from '../services/datum.service';
import { EntityService } from '../services/entity.service';
import { IndicatorService } from '../services/indicator.service';
import { UtilitiesService } from '../services/utilities.service';

@NgComponent({
    selector: 'app-indicator-line-chart',
    templateUrl: './indicator.linechart.component.html',
    standalone: false
})
export class IndicatorLineChartComponent implements OnInit, Widget {

    @Output() loading: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() error: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() title: EventEmitter<string> = new EventEmitter<string>(true);
    @Output() subtitle: EventEmitter<string> = new EventEmitter<string>();

    private _settings: IndicatorLineChartSettings;
    @Input() set settings(s: IndicatorLineChartSettings) {
        if (!s) return;
        this._settings = s;
        this.load();
    }

    public chartOptions: EChartsOption;

    public indicator: Indicator;
    public entity: Entity;

    public data: Datum[];

    constructor(
        private datumService: DatumService,
        private indicatorService: IndicatorService,
        private entityService: EntityService,
        private utilitiesService: UtilitiesService
    ) {
    }

    ngOnInit(): void {
    }

    load(): void {

        if (!this._settings.indicatorId || !this._settings.entityId) {
            this.loading.emit(false);
            this.error.emit(true);
            return;
        }

        forkJoin({
            data: this.datumService.search({
                pageSize: 0, // todo: how to handle lots of data?
                includeParents: true,
                indicatorId: this._settings.indicatorId,
                entityId: this._settings.entityId,
                dateType: this._settings.dateType
            } as DatumSearchOptions),
            indicator: this.indicatorService.get(this._settings.indicatorId),
            entity: this.entityService.get(this._settings.entityId)
        }).subscribe({
            next: response => {

                this.indicator = response.indicator;
                this.entity = response.entity;

                this.title.emit(response.indicator.name);
                this.subtitle.emit(response.entity.name);

                response.data.data.sort((a, b) => a.date.sortOrder - b.date.sortOrder);
                this.data = response.data.data;

                const xCategories: string[] = [];
                const values: number[] = [];
                const formatter = this.utilitiesService.getFormatter(response.indicator);

                response.data.data.forEach(datum => {
                    xCategories.push(datum.date.code);
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
                    series: [
                        {
                            name: `${response.indicator.code}: ${response.entity.name}`,
                            data: values,
                            type: 'line',
                            showBackground: false
                        }
                    ],
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
            error: () => {
                this.loading.emit(false);
                this.error.emit(true);
            }
        });
    }
}
