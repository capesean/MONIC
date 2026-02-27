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
export enum ChartType { BarChart, LineChart }

export class Settings {
    primaryAxisIndicatorIds: string[] = [];
    secondaryAxisIndicatorIds: string[] = [];
    barColor: string;
    xAxisFontSize: number;
    xAxisRotation: number;
    xAxisSort: string;
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
    lineColor: string;
    lineWidth: number;
    lineMarkerSize: number = 15;
    legendPosition: LegendPosition;
    stackType: StackTypes = StackTypes.None;
    entityIds: string[] = [];

    constructor() {
        this.xAxisFontSize = 10;
        this.barColor = '#00BAC7';
        this.xAxisRotation = 90;
        this.primaryAxisFontSize = 10;
        this.xAxisSort = 'name';
        this.gridLeft = 80;
        this.gridRight = 10;
        this.gridTop = 10;
        this.gridBottom = 75;
        this.showPrimaryAxisTitle = true;
        this.primaryAxisTitleGap = 50;
        this.height = 500;
        this.lineColor = '#fa9064';
        this.lineWidth = 5;
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
