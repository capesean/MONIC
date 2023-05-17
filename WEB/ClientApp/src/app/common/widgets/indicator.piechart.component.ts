import { Component as NgComponent, EventEmitter, Input, OnInit, Output } from '@angular/core';
import * as d3 from 'd3';
import { EChartsOption } from 'echarts';
import { forkJoin } from 'rxjs';
import { DataStatus, DataStatusOptions } from '../models/datum.model';
import { DateService } from '../services/date.service';
import { Date } from '../models/date.model';
import { DatumService } from '../services/datum.service';
import { IndicatorPieChartSettings, Widget } from '../models/widget.model';

@NgComponent({
    selector: 'app-indicator-pie-chart',
    templateUrl: './indicator.piechart.component.html'
})
export class IndicatorPieChartComponent implements OnInit, Widget {

    @Output() loading: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() error: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() title: EventEmitter<string> = new EventEmitter<string>(true);
    @Output() subtitle: EventEmitter<string> = new EventEmitter<string>();

    private _settings: IndicatorPieChartSettings;
    @Input() set settings(s: IndicatorPieChartSettings) {
        if (!s) return;
        this._settings = s;
        this.load();
    }

    public chartOptions: EChartsOption;

    public date: Date;
    public dataStatus: DataStatus;

    constructor(
        private datumService: DatumService,
        private dateService: DateService
    ) {
    }

    ngOnInit(): void {
    }

    public load(): void {

        if (!this._settings.dateId) {
            this.loading.emit(false);
            this.error.emit(true);
            return;
        }

        forkJoin({
            dataStatus: this.datumService.status({ dateIds: [this._settings.dateId] } as DataStatusOptions),
            date: this.dateService.get(this._settings.dateId)
        }).subscribe({
            next: response => {

                this.dataStatus = response.dataStatus;
                this.date = response.date;

                this.title.emit("Data Status");
                this.subtitle.emit(response.date.name);

                const data: any[] = [];
                data.push({ name: "Missing", value: response.dataStatus.missing, itemStyle: { color: "#d7191c" } });
                data.push({ name: "Captured", value: response.dataStatus.captured, itemStyle: { color: "#fdae61" } });
                data.push({ name: "Submitted", value: response.dataStatus.submitted, itemStyle: { color: "#ffffbf" } });
                data.push({ name: "Verified", value: response.dataStatus.verified, itemStyle: { color: "#a6d96a" } });
                data.push({ name: "Approved", value: response.dataStatus.approved, itemStyle: { color: "#1a9641" } });

                const formatter = (value: any): string => {
                    return `${value.data.name}: ${d3.format(`,`)(value.data.value)}`
                };

                this.chartOptions = {
                    grid: {
                        left: 0,
                        right: 0,
                        top: 0,
                        bottom: 0
                    },
                    tooltip: {
                        trigger: 'item',
                        textStyle: {
                            fontSize: 10
                        }
                    },
                    legend: {
                        show: false
                    },
                    series: [
                        {
                            name: 'Data Status',
                            type: 'pie',
                            radius: ['0%', '85%'],
                            avoidLabelOverlap: false,
                            label: {
                                show: true,
                                distance: 1,
                                offset: 0,
                                position: 'inside',
                                lineHeight: 0,
                                margin: 0,
                                padding: 0,
                                formatter: formatter,
                                fontStyle: {
                                    fontSize: 9
                                }
                            },
                            emphasis: {
                                disabled: true
                            },
                            labelLine: {
                                show: false
                            },
                            data: data
                        }
                    ]
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
