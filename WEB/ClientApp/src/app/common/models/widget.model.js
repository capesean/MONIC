//import { EventEmitter } from "@angular/core";
import { WidgetSizes } from "./enums.model";
export class Widget {
}
export class WidgetSettings {
    constructor(widgetType) {
        if (!this.id)
            this.id = crypto['randomUUID']();
        this.widgetType = widgetType;
        this.width = WidgetSizes.Medium;
        this.height = WidgetSizes.Medium;
    }
}
export class BarChartSettings extends WidgetSettings {
}
export class LineChartSettings extends WidgetSettings {
}
export class MapSettings extends WidgetSettings {
    constructor() {
        super(...arguments);
        this.minColor = "#ff0000";
        this.maxColor = "#00ff00";
        this.opacity = 1;
    }
}
export class PieChartSettings extends WidgetSettings {
}
//# sourceMappingURL=widget.model.js.map