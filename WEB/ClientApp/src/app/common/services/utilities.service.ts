import { Injectable } from "@angular/core";
import { WidgetSizes } from "../models/enums.model";

@Injectable({ providedIn: 'root' })
export class UtilitiesService {

    constructor() {
    }

    getHeight(size: WidgetSizes): number {
        if (size === WidgetSizes.ExtraSmall) return 150;
        else if (size === WidgetSizes.Small) return 250;
        else if (size === WidgetSizes.Medium) return 350;
        else if (size === WidgetSizes.Large) return 450;
        else if (size === WidgetSizes.ExtraLarge) return 550;
        throw "Invalid size in getHeight";
    }

}
