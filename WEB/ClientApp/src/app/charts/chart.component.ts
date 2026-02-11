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
import { catchError, EMPTY, finalize, forkJoin, of, take, tap } from 'rxjs';

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
    stacked: boolean;
    stacked100: boolean;

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
        this.stacked = true;
        this.stacked100 = false;
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

type Id = string;

function indexBy<T>(items: T[], key: (t: T) => Id): Map<Id, T> {
    const m = new Map<Id, T>();
    for (const it of items) m.set(key(it), it);
    return m;
}

type RowKey = `${string}|${string}`; // indicatorId|entityId
function makeRowKey(indicatorId: string, entityId: string): RowKey {
    return `${indicatorId}|${entityId}`;
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
    IndicatorTypes = IndicatorTypes;

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
            this.chartService.search({ q: 'STA' } as any).subscribe(result => this.loadChart(result.charts[0]));
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

        this.settingsObjects.indicator = undefined as Indicator;
        this.settingsObjects.indicator2 = undefined as Indicator;

        if (!settings.indicatorId) {
            this.isInitializing = false;
            return;
        }

        const indicator1$ = this.indicatorService.get(settings.indicatorId).pipe(take(1));

        const indicator2$ = settings.indicatorId2
            ? this.indicatorService.get(settings.indicatorId2).pipe(take(1))
            : of(undefined);

        forkJoin({ indicator1: indicator1$, indicator2: indicator2$ })
            .pipe(
                tap(({ indicator1, indicator2 }) => {
                    this.settingsObjects.indicator = indicator1;
                    this.settingsObjects.indicator2 = indicator2 as Indicator | undefined;
                }),
                finalize(() => (this.isInitializing = false)),
                catchError(err => {
                    this.errorService.handleError(err, 'Chart', 'Load Settings');
                    return EMPTY;
                })
            )
            .subscribe(() => this.loadData());
    }

    settingChanged() {
        if (this.isInitializing) return;
        this.loadData();
    }

    loadData() {
        if (!this.settings.indicatorId) return;

        this.chartService.getData(this.settings.indicatorId, this.settings.indicatorId2).subscribe({
            next: data => {
                // sort (desc) by the numerical .sortOrder field:
                data.indicators.sort((a, b) => b.sortOrder - a.sortOrder);
                this.data = data as Data;
                this.updateChart();
            },
            error: err => this.errorService.handleError(err, "Chart", "Load Data")
        });
    }

    updateChart() {

        if (!this.data) return;

        const hasSerie2 = !!this.data.indicatorId2;

        const indicatorById = indexBy(this.data.indicators, i => i.indicatorId);
        const entityById = indexBy(this.data.entities, e => e.entityId);
        const dateById = indexBy(this.data.dates, d => d.dateId);

        const rowByIndicatorEntity = new Map<RowKey, Row>();

        const rows: Row[] = [];
        for (const datum of this.data.data) {
            const indicator = indicatorById.get(datum.indicatorId)!;
            const entity = entityById.get(datum.entityId)!;
            const date = dateById.get(datum.dateId)!;

            if (!indicator || !entity || !date) continue;

            const row: Row = { indicator, entity, date, datum };
            rows.push(row);
            rowByIndicatorEntity.set(makeRowKey(indicator.indicatorId, entity.entityId), row);
        }

        this.data.indicator = indicatorById.get(this.data.indicatorId)!;
        this.data.indicator2 = hasSerie2 ? indicatorById.get(this.data.indicatorId2)! : undefined as any;

        const formatter = this.utilitiesService.getFormatter(this.data.indicator);
        const formatter2 = hasSerie2 ? this.utilitiesService.getFormatter(this.data.indicator2) : undefined;

        const indicatorRows: { indicator: Indicator; indicatorId: string }[] = [];

        if (this.data.indicator.indicatorType !== IndicatorTypes.Group) {
            indicatorRows.push({ indicator: this.data.indicator, indicatorId: this.data.indicator.indicatorId });
        } else {
            for (const i of this.data.indicators) {
                if (i.groupingIndicatorId === this.data.indicator.indicatorId) {
                    indicatorRows.push({ indicator: i, indicatorId: i.indicatorId });
                }
            }
        }

        const isStacked100 =
            this.settings.stacked100 &&
            this.settings.stacked &&
            this.data.indicator.indicatorType === IndicatorTypes.Group;

        const entityTotals = new Map<string, number>();
        for (const e of this.data.entities) entityTotals.set(e.entityId, 0);

        for (const e of this.data.entities) {
            let total = 0;
            for (const ir of indicatorRows) {
                const row = rowByIndicatorEntity.get(makeRowKey(ir.indicatorId, e.entityId));
                total += row?.datum?.value ?? 0;
            }
            entityTotals.set(e.entityId, total);
        }

        const entities = [...this.data.entities];
        if (this.settings.xAxisSort === 'name') {
            entities.sort((a, b) => a.name.localeCompare(b.name));
        } else if (this.settings.xAxisSort === 'value') {
            entities.sort((a, b) => (entityTotals.get(b.entityId)! - entityTotals.get(a.entityId)!));
        }

        const stackTotalsByEntity = new Map<string, number>();

        if (isStacked100) {
            for (const e of entities) {
                let total = 0;
                for (const ir of indicatorRows) {
                    total += rowByIndicatorEntity.get(makeRowKey(ir.indicatorId, e.entityId))?.datum?.value ?? 0;
                }
                stackTotalsByEntity.set(e.entityId, total);
            }
        }

        const series: (BarSeriesOption | LineSeriesOption)[] = [];

        for (const indicatorRow of indicatorRows) {
            const bso = {} as BarSeriesOption;
            bso.name = indicatorRow.indicator.shortName ?? indicatorRow.indicator.name;
            bso.type = "bar";
            bso.yAxisIndex = 0;

            if (this.data.indicator.indicatorType === IndicatorTypes.Group) {
                if (this.settings.stacked) bso.stack = this.data.indicatorId;
                bso.itemStyle = {
                    color: this.settings.barColor ?? indicatorRow.indicator.color,
                    borderColor: this.settings.barColor ?? indicatorRow.indicator.color
                };
            } else {
                bso.colorBy = this.settings.barColor ? undefined : "data";
                bso.itemStyle = {
                    color: this.settings.barColor,
                    borderColor: this.settings.barColor ?? indicatorRow.indicator.color
                };
            }

            bso.data = entities.map(e => {
                const raw = rowByIndicatorEntity.get(makeRowKey(indicatorRow.indicatorId, e.entityId))?.datum?.value ?? 0;

                if (!isStacked100) return raw;

                const total = stackTotalsByEntity.get(e.entityId) ?? 0;
                return total === 0 ? 0 : (raw / total) * 100;
            });


            series.push(bso);
        }

        if (hasSerie2) {
            const lso = {} as LineSeriesOption;
            lso.name = this.data.indicator2.shortName ?? this.data.indicator2.name;
            lso.type = "line";
            lso.yAxisIndex = 1;

            const color = this.settings.lineColor ?? 'black';
            lso.lineStyle = { color, width: this.settings.lineWidth };
            lso.itemStyle = { color };
            lso.symbol = this.settings.lineMarker ? 'circle' : 'none';
            lso.symbolSize = 14;

            lso.data = entities.map(e => {
                const row = rowByIndicatorEntity.get(makeRowKey(this.data.indicatorId2, e.entityId));
                return row?.datum?.value;
            });

            series.push(lso);
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
                data: entities.map(o => o.name),
                axisLabel: {
                    fontSize: this.settings.xAxisFontSize,
                    rotate: this.settings.xAxisRotation,

                }
            },
            yAxis: [
                {
                    type: 'value',
                    max: isStacked100 ? 100 : undefined,
                    axisLabel: {
                        formatter: isStacked100 ? '{value}%' : formatter,
                        fontSize: this.settings.yAxisFontSize
                    },
                    ...(this.settings.showYAxisTitle && {
                        name: isStacked100 ? 'Percent' : this.data.indicator.name,
                        nameLocation: 'middle',
                        nameGap: this.settings.yAxisTitleGap,
                        nameRotate: 90
                    })
                },
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
                valueFormatter: (v: any) => isStacked100 ? `${(+v).toFixed(1)}%` : formatter(v)
            }
        } as EChartsOption;

    }

    changeBreadcrumb(): void {
        this.breadcrumbService.changeBreadcrumb(this.route.snapshot, (this.chart.name || "(new chart)").substring(0, 25));
    }

    downloadChart() {
        if (!this.chart || !this.echart) return;

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
