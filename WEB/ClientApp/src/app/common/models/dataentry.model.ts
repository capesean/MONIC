import { Category } from "./category.model";
import { Datum } from "./datum.model";
import { Indicator } from "./indicator.model";
import { Subcategory } from "./subcategory.model";

export class CategoryRow {
    category: Category;
    subcategoryRows: SubcategoryRow[];
}

export class SubcategoryRow {
    subcategory: Subcategory;
    indicatorRows: IndicatorRow[];
}

export class IndicatorRow {
    indicator: Indicator;
    datum: Datum;
    units: string;
    changed: boolean;
    state: IndicatorRowState;
    canEdit: boolean;
    checked: boolean;
    canCheck: boolean;
}

export enum IndicatorRowState {
    edit,
    submitted,
    verified,
    approved
}

