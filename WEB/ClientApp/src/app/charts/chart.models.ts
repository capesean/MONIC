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

export class Settings {
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
    stackType: StackTypes;
    entityIds: string[];

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
        this.stackType = StackTypes.None;
        this.entityIds = [];
    }
}

export class Data extends ChartData {
    indicator: Indicator;
    indicator2: Indicator;
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
export function makeRowKey(indicatorId: string, entityId: string): RowKey {
    return `${indicatorId}|${entityId}`;
}
