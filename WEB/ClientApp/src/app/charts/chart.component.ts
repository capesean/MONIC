import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Indicator } from '../common/models/indicator.model';
import { BarSeriesOption, LineSeriesOption } from 'echarts/charts';
import { UtilitiesService } from '../common/services/utilities.service';
import { ChartService } from '../common/services/chart.service';
import { ToastrService } from 'ngx-toastr';
import { Chart } from '../common/models/chart.model';
import { ErrorService } from '../common/services/error.service';
import { ActivatedRoute, Router } from '@angular/router';
import { BreadcrumbService } from '../common/services/breadcrumb.service';
import { IndicatorTypes } from '../common/models/enums.model';
import { NgbModal, NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { EChartsOption, indexBy, LegendPosition, getRowKey, Row, RowKey, Settings, Data, StackTypes, ChartType } from './chart.models';
import { Entity } from '../common/models/entity.model';
import { ConfirmModalComponent, ConfirmModalOptions } from '../common/components/confirm.component';

class SettingsObjects {
    primaryAxisIndicators: Indicator[];
    secondaryAxisIndicators: Indicator[];
    entities: Entity[];
}

@Component({
    selector: 'chart',
    templateUrl: './chart.component.html',
    standalone: false,
    styleUrl: './chart.component.css',
    encapsulation: ViewEncapsulation.None
})
export class ChartComponent implements OnInit {

    public chart: Chart;

    public settings = new Settings();
    public settingsObjects = new SettingsObjects();

    private data: Data;
    private rowLookup = new Map<RowKey, Row>();

    public options: EChartsOption;

    @ViewChild('settingsPanel') settingsPanel: any;

    private echart!: any;

    LegendPosition = LegendPosition;
    IndicatorTypes = IndicatorTypes;
    StackTypes = StackTypes;

    public isNew = true;

    constructor(
        private utilitiesService: UtilitiesService,
        private chartService: ChartService,
        private toastr: ToastrService,
        private errorService: ErrorService,
        private route: ActivatedRoute,
        private breadcrumbService: BreadcrumbService,
        private offcanvasService: NgbOffcanvas,
        private router: Router,
        private modalService: NgbModal
    ) { }

    ngOnInit() {

        this.route.params.subscribe(params => {

            const chartId = params["chartId"];
            this.isNew = chartId === "add";

            if (!this.isNew) {

                this.chartService.get(chartId)
                    .subscribe({
                        next: chart => {
                            this.chart = chart;
                            this.changeBreadcrumb();
                            this.settings = JSON.parse(this.chart.settings);
                            this.loadData();
                        },
                        error: err => {
                            this.errorService.handleError(err, "Chart", "Load");
                            this.router.navigate(['/charts']);
                        }
                    });

            } else {
                this.chart = new Chart();
                this.chart.name = "New chart name";
                this.changeBreadcrumb();
                setTimeout(() => {
                    this.offCanvas(this.settingsPanel, 'end')
                });
            }

        });

    }

    close() {
        this.chart = undefined as any;
        this.options = undefined;
        this.changeBreadcrumb();
    }

    private saveChart(): void {

        if (!this.chart.name) {

            this.toastr.error("A chart name is required.", "Form Error");
            this.offCanvas(this.settingsPanel, 'end')
            return;

        }

        this.chart.settings = JSON.stringify(this.settings);

        this.chartService.save(this.chart)
            .subscribe({
                next: chart => {
                    this.toastr.success("The chart has been saved", "Save Chart");
                    this.chart = chart;
                    if (this.isNew)
                        this.router.navigate(['..', chart.chartId], { relativeTo: this.route });
                },
                error: err => {
                    this.errorService.handleError(err, "Chart", "Save");
                }
            });

    }

    deleteChart() {
        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Chart", text: "Are you sure you want to delete this chart?", deleteStyle: true, ok: "Delete" } as ConfirmModalOptions;
        modalRef.result.then(
            () => {

                this.chartService.delete(this.chart.chartId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The chart has been deleted", "Delete Chart");
                            this.router.navigate(["../"], { relativeTo: this.route });
                            this.offcanvasService.dismiss();
                        },
                        error: err => {
                            this.errorService.handleError(err, "Chart", "Delete");
                        }
                    });

            }, () => { });
    }

    onChartInit(ec: any) {
        this.echart = ec;
    }

    settingChanged() {
        this.loadData();
    }

    loadData() {
        this.chartService.getData(this.settings.primaryAxisIndicatorIds, this.settings.secondaryAxisIndicatorIds, this.settings.entityIds).subscribe({
            next: data => {
                this.data = data as Data;
                this.settingsObjects.primaryAxisIndicators = data.primaryAxisIndicators;
                this.settingsObjects.secondaryAxisIndicators = data.secondaryAxisIndicators;
                this.settingsObjects.entities = data.entities;
                this.updateChart();
            },
            error: err => this.errorService.handleError(err, "Chart", "Load Data")
        });
    }

    updateChart() {

        if (!this.data) return;

        const hasSerie2 = !!this.data.secondaryAxisIndicators.length;

        const indicators = Array.from(
            new Map([...this.data.primaryAxisIndicators, ...this.data.secondaryAxisIndicators].map(x => [x.indicatorId, x])).values()
        );

        const indicatorById = indexBy(indicators, i => i.indicatorId);
        const entityById = indexBy(this.data.entities, e => e.entityId);
        const dateById = indexBy(this.data.dates, d => d.dateId);

        this.rowLookup = new Map<RowKey, Row>();

        const rows: Row[] = [];
        for (const datum of this.data.data) {
            const indicator = indicatorById.get(datum.indicatorId)!;
            const entity = entityById.get(datum.entityId)!;
            const date = dateById.get(datum.dateId)!;

            if (!indicator || !entity || !date) continue;

            const row: Row = { indicator, entity, date, datum };
            rows.push(row);
            this.rowLookup.set(getRowKey(indicator.indicatorId, entity.entityId), row);
        }

        const primaryFormatter = this.utilitiesService.getFormatter(this.data.primaryAxisIndicators[0]);
        const secondaryFormatter = this.data.secondaryAxisIndicators.length ? this.utilitiesService.getFormatter(this.data.secondaryAxisIndicators[0]) : undefined;

        // calculate the totals by entity for the primary axis indicators (used for sorting and percent stacking)
        const entityTotals = new Map<string, number>();
        for (const e of this.data.entities) entityTotals.set(e.entityId, 0);
        for (const e of this.data.entities) {
            let total = 0;
            for (const indicator of this.data.primaryAxisIndicators) {
                const value = this.rowLookup.get(getRowKey(indicator.indicatorId, e.entityId))?.datum?.value ?? 0;
                total += value;
            }
            entityTotals.set(e.entityId, total);
        }

        // sort the entities based on setting
        const entities = [...this.data.entities];
        if (this.settings.xAxisSort === 'name') {
            entities.sort((a, b) => a.name.localeCompare(b.name));
        } else if (this.settings.xAxisSort === 'value') {
            entities.sort((a, b) => (entityTotals.get(b.entityId)! - entityTotals.get(a.entityId)!));
        }
        this.data.entities = entities;

        //const stackTotalsByEntity = new Map<string, number>();

        //if (this.settings.stackType === StackTypes.Percent) {
        //    for (const e of entities) {
        //        let total = 0;
        //        for (const ir of indicatorRows) {
        //            total += rowByIndicatorEntity.get(makeRowKey(ir.indicatorId, e.entityId))?.datum?.value ?? 0;
        //        }
        //        stackTotalsByEntity.set(e.entityId, total);
        //    }
        //}

        const series: (BarSeriesOption | LineSeriesOption)[] = [];

        for (const indicator of this.data.primaryAxisIndicators) {
            const serie = this.getSerie(indicator, ChartType.BarChart);
            serie.yAxisIndex = 0;
            series.push(serie);
        }

        for (const indicator of this.data.secondaryAxisIndicators) {
            const serie = this.getSerie(indicator, ChartType.LineChart);
            serie.yAxisIndex = 1;
            series.push(serie);
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
                    max: this.settings.stackType === StackTypes.Percent ? 100 : undefined,
                    axisLabel: {
                        formatter: this.settings.stackType === StackTypes.Percent ? '{value}%' : primaryFormatter,
                        fontSize: this.settings.primaryAxisFontSize
                    },
                    ...(this.settings.showPrimaryAxisTitle && {
                        name: this.nonEmpty(this.settings.primaryAxisTitleText)
                            ?? this.settingsObjects.primaryAxisIndicators[0]?.name
                            ?? "",
                        nameLocation: 'middle',
                        nameGap: this.settings.primaryAxisTitleGap,
                        nameRotate: 90
                    })
                },
                ...(hasSerie2 ? [{
                    type: 'value',
                    axisLabel: {
                        formatter: secondaryFormatter,
                        fontSize: this.settings.secondaryAxisFontSize
                    },
                    splitLine: { show: false },
                    ...(this.settings.showSecondaryAxisTitle && {
                        name: this.nonEmpty(this.settings.secondaryAxisTitleText)
                            ?? this.settingsObjects.secondaryAxisIndicators[0]?.name
                            ?? "",
                        nameLocation: 'middle',
                        nameGap: this.settings.secondaryAxisTitleGap,
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
                        formatter: primaryFormatter
                    }
                },
                valueFormatter: (v: any) => this.settings.stackType === StackTypes.Percent ? `${(+v).toFixed(1)}%` : primaryFormatter(v)
            }
        } as EChartsOption;

    }

    private getSerie(indicator: Indicator, chartType: ChartType): (BarSeriesOption | LineSeriesOption) {

        let option = undefined as (BarSeriesOption | LineSeriesOption);

        if (chartType === ChartType.BarChart) {
            option = {} as BarSeriesOption;
            option.type = "bar";
            if (this.settings.stackType !== StackTypes.None) option.stack = 'primary';
            option.itemStyle = {
                color: this.settings.barColor ?? indicator.color,
                borderColor: this.settings.barColor ?? indicator.color
            };
        } else {
            option = {} as LineSeriesOption;
            option.type = "line";
            if (this.settings.stackType !== StackTypes.None) option.stack = 'primary';
            option.itemStyle = {
                color: this.settings.barColor ?? indicator.color,
                borderColor: this.settings.barColor ?? indicator.color
            };
            const color = this.settings.lineColor ?? 'black';
            option.lineStyle = { color, width: this.settings.lineWidth };
            option.itemStyle = { color };
            option.symbol = this.settings.lineMarkerSize ? 'circle' : 'none';
            option.symbolSize = this.settings.lineMarkerSize ?? 15;
        }

        option.name = indicator.shortName ?? indicator.name;
        option.data = this.data.entities.map(e => {
            const raw = this.rowLookup.get(getRowKey(indicator.indicatorId, e.entityId))?.datum?.value ?? 0;

            if (this.settings.stackType !== StackTypes.Percent) return raw;

            alert("TODO: Stacked by Percent has not been implemented");
            throw new Error("Not implemented - calculating percentage for stack - do this outside getSerie?");
            //const total = stackTotalsByEntity.get(e.entityId) ?? 0;
            //return total === 0 ? 0 : (raw / total) * 100;
        });

        return option;
    }

    changeBreadcrumb(): void {
        this.breadcrumbService.changeBreadcrumb(this.route.snapshot, (this.chart?.name || "(new chart)").substring(0, 25));
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

    public offCanvas(content: any, position: 'start' | 'end' | 'top' | 'bottom' = 'start') {
        this.offcanvasService.open(content, { position: position })
            .result.finally(() => this.saveChart());
    }

    entitiesChanged(entities: Entity[]) {
        this.settings.entityIds = entities.map(e => e.entityId);
        this.loadData();
    }

    public nonEmpty(s: string | null | undefined) {
        const t = s?.trim();
        return t ? t : undefined;
    }
}
