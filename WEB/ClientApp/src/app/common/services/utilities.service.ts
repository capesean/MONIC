import { Inject, Injectable, LOCALE_ID } from "@angular/core";
import { DataTypes, WidgetSizes } from "../models/enums.model";
import { Indicator } from "../models/indicator.model";
import * as d3 from 'd3';
import { DecimalPipe, PercentPipe, CurrencyPipe } from "@angular/common";

@Injectable({ providedIn: 'root' })
export class UtilitiesService {

    constructor(
        private percentPipe: PercentPipe,
        private decimalPipe: DecimalPipe,
        private currencyPipe: CurrencyPipe,
        @Inject(LOCALE_ID) private locale: string
    ) {
    }

    getHeight(size: WidgetSizes): number {
        if (size === WidgetSizes.ExtraSmall) return 250;
        else if (size === WidgetSizes.Small) return 350;
        else if (size === WidgetSizes.Medium) return 450;
        else if (size === WidgetSizes.Large) return 550;
        else if (size === WidgetSizes.ExtraLarge) return 650;
        throw "Invalid size in getHeight";
    }

    getFormatter(indicator: Indicator) {
        return (value: any) => {

            if (typeof value === 'number' && !isNaN(value)) {
                // value is a number
            }
            else if (value && typeof value.value === 'number' && !isNaN(value.value))
                value = value.value;
            else if (value && value.axisDimension === "x")
                return value.value;
            else 
                value = undefined;

            if (indicator.dataType === DataTypes.Percent) return this.percentPipe.transform(value, `1.${indicator.decimalPlaces}-${indicator.decimalPlaces}`, this.locale);
            if (indicator.dataType === DataTypes.Number) return this.decimalPipe.transform(value, `1.${indicator.decimalPlaces}-${indicator.decimalPlaces}`, this.locale);
            if (indicator.dataType === DataTypes.Currency) return this.currencyPipe.transform(value, indicator.units, 'symbol', `1.${indicator.decimalPlaces}-${indicator.decimalPlaces}`, this.locale);
            throw "Unhandled Indicator.DataType";
        };
    }
}
