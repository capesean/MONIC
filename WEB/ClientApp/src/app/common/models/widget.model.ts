//import { EventEmitter } from "@angular/core";
import { DateTypes, WidgetSizes, WidgetTypes } from "./enums.model";

export abstract class Widget {
    //loading: EventEmitter<boolean>;
    //error: EventEmitter<boolean>;
    //title: EventEmitter<string>;
    //subtitle: EventEmitter<string>;

    abstract set settings(s: IndicatorMapSettings | IndicatorLineChartSettings | IndicatorBarChartSettings | IndicatorPieChartSettings | FolderShortcutSettings);

    abstract load(): void;
}

export class WidgetSettings {
    id: string;
    widgetType: WidgetTypes;
    width: WidgetSizes;
    height: WidgetSizes;

    constructor(widgetType: WidgetTypes) {
        if (!this.id) this.id = (crypto as any)['randomUUID']();
        this.widgetType = widgetType;
        this.width = WidgetSizes.Medium;
        this.height = WidgetSizes.Medium;
    }

}

export class IndicatorBarChartSettings extends WidgetSettings {
    indicatorId: string;
    entityTypeId: string;
    dateId: string;
}

export class IndicatorLineChartSettings extends WidgetSettings {
    indicatorId: string;
    entityIds: string[] = [];
    dateType: DateTypes;
}

export class IndicatorMapSettings extends WidgetSettings {
    indicatorId: string;
    dateId: string;
    entityTypeId: string;
    minColor: string = "#ff0000";
    maxColor: string = "#00ff00";
    opacity: number = 1;
}

export class IndicatorPieChartSettings extends WidgetSettings {
    dateId: string;
}

export class QuestionnaireBarChartSettings extends WidgetSettings {
    questionnaireId: string;
    dateId: string;
    entityIds: string[] = [];
}

export class FolderShortcutSettings extends WidgetSettings {
    folderId: string;
}
