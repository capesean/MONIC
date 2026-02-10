import { Component, OnInit, ViewChild } from '@angular/core';
import { Indicator } from '../common/models/indicator.model';
import { BarSeriesOption, LineSeriesOption } from 'echarts/charts';
import { UtilitiesService } from '../common/services/utilities.service';
import { IndicatorService } from '../common/services/indicator.service';
import { ChartData, ChartService } from '../common/services/chart.service';
import { NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Chart } from '../common/models/chart.model';
import { ErrorService } from '../common/services/error.service';
import { ActivatedRoute } from '@angular/router';
import { BreadcrumbService } from '../common/services/breadcrumb.service';
import { ChartModalComponent } from '../admin/charts/chart.modal.component';
import { ComposeOption } from 'echarts/core';
import { GridComponentOption, TooltipComponentOption, LegendComponentOption } from 'echarts/components';
import { IndicatorTypes } from '../common/models/enums.model';
import { Entity } from '../common/models/entity.model';
import { AppDate } from '../common/models/date.model';
import { Datum } from '../common/models/datum.model';

type EChartsOption = ComposeOption<
    | BarSeriesOption
    | LineSeriesOption
    | GridComponentOption
    | TooltipComponentOption
    | LegendComponentOption
>;

enum LegendPosition { None, Top, Bottom }

class Settings {
    indicatorId: string;
    barColor: string;
    yAxisFontSize: number;
    xAxisFontSize: number;
    xAxisRotation: number;
    xAxisSort: string;
    gridLeft: number;
    gridRight: number;
    gridTop: number;
    gridBottom: number;
    showYAxisTitle: boolean;
    yAxisTitleGap: number;
    height: number;
    indicatorId2: string;
    lineColor: string;
    lineWidth: number;
    lineMarker: boolean;
    legendPosition: LegendPosition;

    constructor() {
        this.xAxisFontSize = 10;
        this.barColor = '#00BAC7';
        this.xAxisRotation = 90;
        this.yAxisFontSize = 10;
        this.xAxisSort = 'name';
        this.gridLeft = 80;
        this.gridRight = 10;
        this.gridTop = 10;
        this.gridBottom = 75;
        this.showYAxisTitle = true;
        this.yAxisTitleGap = 50;
        this.height = 500;
        this.lineColor = '#fa9064';
        this.lineWidth = 5;
        this.lineMarker = true;
        this.legendPosition = LegendPosition.None;
    }
}

class Data extends ChartData {
    indicator: Indicator;
    indicator2: Indicator;
}

class Row {
    indicator: Indicator;
    entity: Entity;
    date: AppDate;
    datum: Datum;
}

@Component({
    selector: 'chart',
    templateUrl: './chart.component.html',
    standalone: false
})
export class ChartComponent implements OnInit {

    public chart: Chart;

    public settings = new Settings();

    public settingsObjects = {
        indicator: undefined as Indicator,
        indicator2: undefined as Indicator
    }

    public data: Data;

    public options: EChartsOption;

    private isInitializing = false;

    @ViewChild('modal') chartModal: ChartModalComponent;

    private echart!: any;

    LegendPosition = LegendPosition;

    constructor(
        private utilitiesService: UtilitiesService,
        private indicatorService: IndicatorService,
        private chartService: ChartService,
        private toastr: ToastrService,
        private errorService: ErrorService,
        private route: ActivatedRoute,
        private breadcrumbService: BreadcrumbService
    ) { }

    ngOnInit() {

        this.chart = new Chart();
        this.chart.name = "New Chart";

        if (window.location.hostname === 'localhost') {
            this.chartService.search({} as any).subscribe(result => this.loadChart(result.charts[0]));
        } else {
            this.setSettings(new Settings());
        }

        this.changeBreadcrumb();
    }

    save(form: NgForm): void {

        if (form.invalid) {

            this.toastr.error("The form has not been completed correctly.", "Form Error");
            return;

        }

        this.chart.settings = JSON.stringify(this.settings);

        this.chartService.save(this.chart)
            .subscribe({
                next: chart => {
                    this.toastr.success("The chart has been saved", "Save Chart");
                    this.chart = chart;
                },
                error: err => {
                    this.errorService.handleError(err, "Chart", "Save");
                }
            });

    }

    loadChart(chart: Chart) {
        this.chart = chart;
        this.changeBreadcrumb();
        this.setSettings(JSON.parse(this.chart.settings));
    }

    onChartInit(ec: any) {
        this.echart = ec;
    }

    private setSettings(settings: Settings) {
        this.isInitializing = true;

        this.settings = settings;

        if (settings.indicatorId) {
            this.indicatorService.get(settings.indicatorId).subscribe(indicator => {
                this.settingsObjects.indicator = indicator

                this.loadData();

                if (settings.indicatorId2) {
                    this.indicatorService.get(settings.indicatorId2).subscribe(indicator2 => this.settingsObjects.indicator2 = indicator2);
                    this.isInitializing = false;
                } else {
                    this.isInitializing = false;
                }
            });
        } else {
            this.isInitializing = false;
        }

    }

    settingChanged() {
        if (this.isInitializing) return;
        this.loadData();
    }

    loadData() {
        if (!this.settings.indicatorId) return;

        this.chartService.getData(this.settings.indicatorId, this.settings.indicatorId2).subscribe({
            next: data => {
                this.data = data as Data;
                this.updateChart();
            },
            error: err => this.errorService.handleError(err, "Chart", "Load Data")
        });
    }

    updateChart() {

        const hasSerie2 = !!this.data.indicatorId2;

        this.data.indicator = this.data.indicators.find(o => o.indicatorId === this.data.indicatorId);
        this.data.indicator2 = this.data.indicators.find(o => o.indicatorId === this.data.indicatorId2);

        const formatter = this.utilitiesService.getFormatter(this.data.indicator);
        const formatter2 = hasSerie2 ? this.utilitiesService.getFormatter(this.data.indicator2) : undefined;

        var rows: Row[] = [];
        for (const datum of this.data.data) {
            const indicator = this.data.indicators.find(i => i.indicatorId === datum.indicatorId);
            const entity = this.data.entities.find(e => e.entityId === datum.entityId);
            const date = this.data.dates.find(d => d.dateId === datum.dateId);
            rows.push({ indicator, entity, date, datum });
        }

        const indicatorRows: { indicator: Indicator, rows: Row[] }[] = [];

        if (this.data.indicator.indicatorType !== IndicatorTypes.Group) {
            indicatorRows.push({
                indicator: this.data.indicator,
                rows: rows.filter(r => r.indicator.indicatorId === this.data.indicator.indicatorId)
            });
        } else {
            for (const indicator of this.data.indicators) {
                if (indicator.groupingIndicatorId === this.data.indicator.indicatorId) {
                    indicatorRows.push({
                        indicator: indicator,
                        rows: rows.filter(r => r.indicator.indicatorId === indicator.indicatorId)
                    });
                }
            }
        }

        const entityTotals = new Map<string, number>();

        for (const entity of this.data.entities) {
            entityTotals.set(entity.entityId, 0);

            for (const indicatorRow of indicatorRows) {
                const row = indicatorRow.rows.find(d => d.entity.entityId === entity.entityId && d.indicator.indicatorId === indicatorRow.indicator.indicatorId);
                //serie.serie.data.push(datum?.value);
                entityTotals.set(entity.entityId, entityTotals.get(entity.entityId)! + (row?.datum?.value ?? 0));
            }
        }

        if (this.settings.xAxisSort === 'name') {
            this.data.entities.sort((a, b) => a.name.localeCompare(b.name));
        } else if (this.settings.xAxisSort === 'value') {
            this.data.entities.sort((a, b) => entityTotals.get(b.entityId) - entityTotals.get(a.entityId));
        }

        const series: (BarSeriesOption | LineSeriesOption)[] = [];
        for (const indicatorRow of indicatorRows) {
            const bso = {} as BarSeriesOption;
            bso.name = indicatorRow.indicator.shortName ?? indicatorRow.indicator.name;
            bso.type = "bar";
            bso.yAxisIndex = 0;

            if (this.data.indicator.indicatorType === IndicatorTypes.Group) {
                bso.stack = this.data.indicatorId;
                if (this.settings.barColor) {
                    bso.itemStyle = {
                        color: this.settings.barColor
                    };
                }
            } else {
                bso.colorBy = this.settings.barColor ? undefined : "data";
                bso.itemStyle = {
                    color: this.settings.barColor
                };
            }

            bso.data = [];
            for (const entity of this.data.entities) {
                const row = indicatorRow.rows.find(d => d.entity.entityId === entity.entityId);
                bso.data.push(row?.datum?.value);
            }

            series.push(bso);
        }

        if (hasSerie2) {

            const bso = {} as LineSeriesOption;

            bso.name = this.data.indicator2.shortName ?? this.data.indicator2.name;
            bso.type = "line";
            bso.yAxisIndex = 1;

            bso.lineStyle = {
                color: this.settings.lineColor ?? 'black',
                width: this.settings.lineWidth
            };
            bso.itemStyle = {
                color: this.settings.lineColor ?? 'black'
            };
            bso.symbol = this.settings.lineMarker ? 'circle' : 'none';
            bso.symbolSize = 14;

            bso.data = [];
            const indicator2Rows = rows.filter(r => r.indicator.indicatorId === this.data.indicatorId2);
            for (const entity of this.data.entities) {
                const row = indicator2Rows.find(o => o.entity.entityId === entity.entityId);
                bso.data.push(row?.datum?.value);
            }

            series.push(bso);
        }

        this.options = {
            grid: {
                left: this.settings.gridLeft,
                right: this.settings.gridRight,
                top: this.settings.gridTop,
                bottom: this.settings.gridBottom
            },
            xAxis: {
                type: 'category',
                data: this.data.entities.map(o => o.name),
                axisLabel: {
                    fontSize: this.settings.xAxisFontSize,
                    rotate: this.settings.xAxisRotation,

                }
            },
            yAxis: [
                {
                    type: 'value',
                    axisLabel: {
                        formatter: formatter,
                        fontSize: this.settings.yAxisFontSize
                    },
                    ...(this.settings.showYAxisTitle && {
                        name: this.data.indicator.name,
                        nameLocation: 'middle',
                        nameGap: this.settings.yAxisTitleGap,
                        nameRotate: 90
                    })
                }
                ,
                ...(hasSerie2 ? [{
                    type: 'value',
                    axisLabel: {
                        formatter: formatter2,
                        fontSize: this.settings.yAxisFontSize
                    },
                    splitLine: { show: false },
                    ...(this.settings.showYAxisTitle && {
                        name: this.data.indicator2.name,
                        nameLocation: 'middle',
                        nameGap: this.settings.yAxisTitleGap,
                        nameRotate: 90
                    })
                }] : [])
            ],
            series: series,
            legend: this.buildLegend(),
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

    }

    changeBreadcrumb(): void {
        this.breadcrumbService.changeBreadcrumb(this.route.snapshot, (this.chart.name || "(new chart)").substring(0, 25));
    }

    downloadChart() {
        if (!this.chart) return;

        const dataUrl = this.echart.getDataURL({
            type: 'png',
            pixelRatio: 3
        });

        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `chart.png`;
        a.click();
    }

    private buildLegend() {
        switch (this.settings.legendPosition) {
            case LegendPosition.Top:
                return { show: true, top: 0, left: 'center', icon: 'rect' };
            case LegendPosition.Bottom:
                return { show: true, bottom: 0, left: 'center', icon: 'rect' };
            default:
                return { show: false };
        }
    }

    newChart() {
        this.chart = new Chart();
        this.data = undefined;
        this.settingsObjects = {} as any;
        this.setSettings(new Settings());
        this.options = undefined;
    }

}
