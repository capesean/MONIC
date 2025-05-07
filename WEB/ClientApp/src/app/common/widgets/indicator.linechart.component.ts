import { Component as NgComponent, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { LineSeriesOption, SeriesOption } from 'echarts/types/dist/echarts';
import { EChartsOption } from 'echarts/types/dist/shared';
import { map } from 'rxjs';
import { forkJoin } from 'rxjs';
import { IndicatorLineChartSettings, Widget } from '../models/widget.model';
import { UtilitiesService } from '../services/utilities.service';
import { WidgetService } from '../services/widget.service';

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

    public noData = false;
    public hasError = false;

    constructor(
        private widgetService: WidgetService,
        private utilitiesService: UtilitiesService
    ) {
    }

    ngOnInit(): void {
    }

    load(): void {

        if (!this._settings.indicatorId || !this._settings.entityIds || !this._settings.entityIds.length) {
            this.loading.emit(false);
            this.error.emit(true);
            this.hasError = true;
            return;
        }

        this.widgetService.load(this._settings.indicatorId, this._settings.entityIds, this._settings.dateType)
            .subscribe({
                next: response => {

                    this.noData = response.data.length === 0;

                    this.title.emit(response.indicator.name);
                    this.subtitle.emit(response.entities[0].name + (response.entities.length === 1 ? "" : ` and ${response.entities.length} more`));


                    const xCategories: string[] = [];
                    const formatter = this.utilitiesService.getFormatter(response.indicator);

                    const series: LineSeriesOption[] = [];

                    response.dates.forEach(date => {
                        xCategories.push(date.code);
                    });

                    response.entities.forEach(entity => {
                        const serie = { data: [], type: 'line', name: entity.name } as LineSeriesOption;
                        // todo: not optimal
                        response.dates.forEach(date => {
                            serie.data.push(response.data.find(o => o.entityId === entity.entityId && o.dateId === date.dateId));
                        });

                        series.push(serie);
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
                        series: series,
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
