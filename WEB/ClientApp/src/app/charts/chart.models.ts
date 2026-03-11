import { BarSeriesOption, LineSeriesOption } from "echarts/charts";
import { GridComponentOption, TooltipComponentOption, LegendComponentOption } from "echarts/components";
import { ComposeOption } from "echarts/core";
import { AppDate } from "../common/models/date.model";
import { Datum } from "../common/models/datum.model";
import { Entity } from "../common/models/entity.model";
import { Indicator } from "../common/models/indicator.model";
import { ChartData } from "../common/services/chart.service";

export type EChartsOption = ComposeOption<
    | BarSeriesOption
    | LineSeriesOption
    | GridComponentOption
    | TooltipComponentOption
    | LegendComponentOption
>;

export enum LegendPosition { None, Top, Bottom }
export enum StackTypes { None, Normal, Percent }
export enum ChartTypes { BarChart, LineChart }
export enum Axis { Primary, Secondary }

export class Serie {
    indicatorId: string;
    indicator: Indicator;
    chartType: ChartTypes = ChartTypes.BarChart;
    color: string;
    lineWidth: number = 5;
    markerSize: number = 15;
    markerColor: string;
    axis: Axis = Axis.Primary;
}

export class Settings {
    series: Serie[] = [];

    // needs primary & secondary stack types?
    stackType: StackTypes = StackTypes.None;

    xAxisFontSize: number;
    xAxisRotation: number;
    xAxisSort: string;
    xAxisSortDesc: boolean = false;

    gridLeft: number;
    gridRight: number;
    gridTop: number;
    gridBottom: number;

    showPrimaryAxisTitle: boolean;
    primaryAxisTitleGap: number;
    primaryAxisTitleText: string
    primaryAxisFontSize: number;

    showSecondaryAxisTitle: boolean;
    secondaryAxisTitleGap: number;
    secondaryAxisTitleText: string
    secondaryAxisFontSize: number;

    height: number;
    legendPosition: LegendPosition;
    entityIds: string[] = [];

    constructor() {
        this.xAxisFontSize = 10;
        this.xAxisRotation = 90;
        this.primaryAxisFontSize = 10;
        this.xAxisSort = 'name';
        this.gridLeft = 80;
        this.gridRight = 40;
        this.gridTop = 10;
        this.gridBottom = 75;
        this.showPrimaryAxisTitle = true;
        this.primaryAxisTitleGap = 50;
        this.height = 500;
        this.legendPosition = LegendPosition.None;
        this.stackType = StackTypes.None;
        this.entityIds = [];
    }
}

export class Data extends ChartData {
    //indicator: Indicator;
    //indicator2: Indicator;
}

export class Row {
    indicator: Indicator;
    entity: Entity;
    date: AppDate;
    datum: Datum;
}

export type Id = string;

export function indexBy<T>(items: T[], key: (t: T) => Id): Map<Id, T> {
    const m = new Map<Id, T>();
    for (const it of items) m.set(key(it), it);
    return m;
}

export type RowKey = `${string}|${string}`; // indicatorId|entityId
export function getRowKey(indicatorId: string, entityId: string): RowKey {
    return `${indicatorId}|${entityId}`;
}
