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
import { EChartsOption, indexBy, LegendPosition, getRowKey, Row, RowKey, Settings, Data, StackTypes, ChartTypes, Serie, Axis } from './chart.models';
import { Entity } from '../common/models/entity.model';
import { ConfirmModalComponent, ConfirmModalOptions } from '../common/components/confirm.component';
import { NgForm } from '@angular/forms';
import { SerieComponent } from './serie.component';
import { IndicatorService } from '../common/services/indicator.service';
import { forkJoin, map, tap } from 'rxjs';
import { CdkDragDrop, CdkDragStart, moveItemInArray } from '@angular/cdk/drag-drop';

class SettingsObjects {
    //primaryAxisIndicators: Indicator[] = [];
    //secondaryAxisIndicators: Indicator[] = [];
    entities: Entity[] = [];
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
    @ViewChild('form') form: NgForm;

    private bodyElement: HTMLElement = document.body;

    private echart!: any;

    LegendPosition = LegendPosition;
    IndicatorTypes = IndicatorTypes;
    StackTypes = StackTypes;

    public isNew = true;

    // should be in an app setting/config
    public defaultColor = '#00BAC7';

    constructor(
        private utilitiesService: UtilitiesService,
        private chartService: ChartService,
        private toastr: ToastrService,
        private errorService: ErrorService,
        private route: ActivatedRoute,
        private breadcrumbService: BreadcrumbService,
        private offcanvasService: NgbOffcanvas,
        private router: Router,
        private modalService: NgbModal,
        private indicatorService: IndicatorService
    ) { }

    ngOnInit() {

        //if (window.location.hostname === "localhost") {
        //    setTimeout(() => {
        //        this.offcanvasService.dismiss();
        //        setTimeout(() => {
        //            this.showSettings(this.settingsPanel, 'end');
        //        });
        //    })
        //}

        this.route.params.subscribe(params => {

            const chartId = params["chartId"];
            this.isNew = chartId === "add";

            if (!this.isNew) {

                this.chartService.get(chartId)
                    .subscribe({
                        next: chart => {

                            const settings: Settings = Object.assign(
                                new Settings(),
                                JSON.parse(chart.settings)
                            ) as Settings;

                            const gets = settings.series.map(serie =>
                                this.indicatorService.get(serie.indicatorId).pipe(
                                    map(indicator => ({ serie, indicator }))
                                )
                            );

                            // todo: not an ideal way to load multiple indicators (could be the same?)
                            forkJoin(gets).subscribe({
                                next: results => {
                                    for (const { serie, indicator } of results) {
                                        serie.indicator = indicator;
                                    }

                                    this.chart = chart;
                                    this.settings = settings;
                                    this.changeBreadcrumb();
                                    this.loadData();
                                },
                                error: err => this.errorService.handleError(err, 'Chart', 'Load Indicators')
                            });

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
                    this.showSettings(this.settingsPanel, 'end')
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
            this.showSettings(this.settingsPanel, 'end')
            return;

        }

        // remove the indicators from the settings before saving
        const savedSettings = {
            ...this.settings,
            series: this.settings.series.map(s => {
                const { indicator, ...rest } = s;
                return rest;
            })
        };

        this.chart.settings = JSON.stringify(savedSettings);

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
        this.chartService.getData(this.settings.series.map(o => o.indicatorId), this.settings.entityIds).subscribe({
            next: data => {
                this.data = data as Data;
                //this.settingsObjects.primaryAxisIndicators = data.primaryAxisIndicators;
                //this.settingsObjects.secondaryAxisIndicators = data.secondaryAxisIndicators;
                this.settingsObjects.entities = data.entities;
                this.updateChart();
            },
            error: err => this.errorService.handleError(err, "Chart", "Load Data")
        });
    }

    updateChart() {

        if (!this.data) return;

        const indicatorById = indexBy(this.data.indicators, i => i.indicatorId);
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

        const series: (BarSeriesOption | LineSeriesOption)[] = [];

        const primaryAxisIndicators: Indicator[] = [];
        const secondaryAxisIndicators: Indicator[] = [];

        for (const serie of this.settings.series) {
            const indicator = indicatorById.get(serie.indicatorId);
            if (!indicator) continue;
            if (serie.axis === Axis.Primary) primaryAxisIndicators.push(indicator);
            else if (serie.axis === Axis.Secondary) secondaryAxisIndicators.push(indicator);

            series.push(this.getSerie(indicator, serie));
        }

        if (!primaryAxisIndicators.length) {
            this.toastr.error("At least one primary axis indicator is required.", "Chart Settings");
            return;
        }

        const hasSecondaryAxis = secondaryAxisIndicators.length > 0;



        const primaryFormatter = this.utilitiesService.getFormatter(primaryAxisIndicators[0]);
        const secondaryFormatter = hasSecondaryAxis ? this.utilitiesService.getFormatter(secondaryAxisIndicators[0]) : undefined;

        // calculate the totals by entity for the primary axis indicators (used for sorting and percent stacking)
        const entityTotals = new Map<string, number>();
        for (const e of this.data.entities) entityTotals.set(e.entityId, 0);
        for (const e of this.data.entities) {
            let total = 0;
            for (const indicator of primaryAxisIndicators) {
                const value = this.rowLookup.get(getRowKey(indicator.indicatorId, e.entityId))?.datum?.value ?? 0;
                total += value;
            }
            entityTotals.set(e.entityId, total);
        }

        // sort the entities based on setting
        const entities = [...this.data.entities];

        const direction = this.settings.xAxisSortDesc ? -1 : 1;
        if (this.settings.xAxisSort === 'name') {
            entities.sort((a, b) =>
                a.name.localeCompare(b.name) * direction
            );
        }
        else if (this.settings.xAxisSort === 'value') {
            entities.sort((a, b) => {
                return (entityTotals.get(a.entityId)! - entityTotals.get(b.entityId)!) * direction;
            });
        }

        let i = 0;
        // find a better way to iterate the settings series with the indicator to set the data to the chart series
        for (const serie of this.settings.series) {
            const chartSerie = series[i];
            chartSerie.data = [];
            for (const e of entities) {
                const value = this.rowLookup.get(getRowKey(serie.indicatorId, e.entityId))?.datum?.value ?? 0;
                chartSerie.data.push(value);
            }
            i++;
        }

        this.data.entities = entities;

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
                            ?? primaryAxisIndicators[0]?.name
                            ?? "",
                        nameLocation: 'middle',
                        nameGap: this.settings.primaryAxisTitleGap,
                        nameRotate: 90
                    })
                },
                ...(hasSecondaryAxis ? [{
                    type: 'value',
                    axisLabel: {
                        formatter: secondaryFormatter,
                        fontSize: this.settings.secondaryAxisFontSize
                    },
                    splitLine: { show: false },
                    ...(this.settings.showSecondaryAxisTitle && {
                        name: this.nonEmpty(this.settings.secondaryAxisTitleText)
                            ?? secondaryAxisIndicators[0]?.name
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

    private getSerie(indicator: Indicator, serie: Serie) {
        const col = serie.color ?? indicator.color ?? this.defaultColor;

        let option = undefined as (BarSeriesOption | LineSeriesOption);
        if (serie.chartType === ChartTypes.BarChart) {
            option = {} as BarSeriesOption;
            option.type = "bar";
            if (this.settings.stackType !== StackTypes.None) option.stack = 'primary';
            option.itemStyle = {
                color: col,
                borderColor: col
            };
        } else {
            option = {} as LineSeriesOption;
            option.type = "line";
            if (this.settings.stackType !== StackTypes.None) option.stack = 'primary';
            option.itemStyle = {
                color: col,
                borderColor: col
            };
            //const color = this.settings.lineColor ?? 'black';
            option.lineStyle = { color: col, width: serie.lineWidth };
            option.itemStyle = { color: serie.markerColor ?? col };
            option.symbol = serie.markerSize > 0 ? 'circle' : 'none';
            option.symbolSize = serie.markerSize ?? 15;
        }

        option.yAxisIndex = serie.axis === Axis.Secondary ? 1 : 0;
        option.name = indicator.shortName ?? indicator.name;

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

    public showSettings(content: any, position: 'start' | 'end' | 'top' | 'bottom' = 'start') {
        const ref = this.offcanvasService.open(content, { position: position });

        ref.closed.subscribe(() => this.handleClose());
        ref.dismissed.subscribe(() => this.handleClose());
    }

    private handleClose() {
        if (this.form?.dirty)
            this.saveChart();
    }

    entitiesChanged(entities: Entity[]) {
        this.settings.entityIds = entities.map(e => e.entityId);
        this.loadData();
    }

    public nonEmpty(s: string | null | undefined) {
        const t = s?.trim();
        return t ? t : undefined;
    }

    editSerie(serie: Serie, isNew = false) {
        
        const modalRef = this.modalService.open(SerieComponent, {
            size: 'lg',
            //backdrop: 'static',
            //keyboard: false
        });
        modalRef.componentInstance.serie = serie;
        modalRef.result.finally(() => {
            // todo: this 'fix' is because i can't set the form to dirty to trigger the save on close.
            // there might not be changes to the serie - so it could create empty charts... how to handle?
            if (isNew && serie.indicatorId) this.settings.series.push(serie);
            this.saveChart();
            this.loadData();
        });
    }

    addSerie() {
        const serie = new Serie();
        this.editSerie(serie, true);
    }

    deleteSerie(index: number) {
        this.settings.series.splice(index, 1);
        this.saveChart();
        this.updateChart();
    }

    dragStart(event: CdkDragStart) {
        this.bodyElement.classList.add('inheritCursors');
        this.saveChart();
        this.bodyElement.style.cursor = 'grabbing';
    }

    drop(event: CdkDragDrop<Serie[]>) {
        this.bodyElement.classList.remove('inheritCursors');
        this.bodyElement.style.cursor = 'unset';
        moveItemInArray(this.settings.series, event.previousIndex, event.currentIndex);
        this.updateChart();
    }
}
