import { SearchOptions, PagingHeaders } from './http.model';
import { EntityType } from './entitytype.model';
import { OptionList } from './optionlist.model';
import { Subcategory } from './subcategory.model';
import { User } from './user.model';
import { AggregationTypes, DataTypes, DateTypes, IndicatorStatuses, IndicatorTypes } from './enums.model';
import { Datum } from './datum.model';
import { IndicatorPermission } from './indicatorpermission.model';
import { LogFrameRowIndicator } from './logframerowindicator.model';
import { Token } from './token.model';
import { ComponentIndicator } from './componentindicator.model';
import { IHasFields } from './ihasfields.model';
import { ItemField } from './itemfield.model';
import { ItemOption } from './itemoption.model';

export class Indicator implements IHasFields {
    indicatorId: string;
    subcategoryId: string;
    name: string;
    code: string;
    units: string;
    indicatorType: IndicatorTypes;
    indicatorStatus: IndicatorStatuses;
    requiresSubmit: boolean;
    requiresVerify: boolean;
    requiresApprove: boolean;
    disableNote: boolean;
    entityTypeId: string;
    frequency: DateTypes;
    dateAggregationType: AggregationTypes;
    dataType: DataTypes;
    optionListId: string;
    decimalPlaces: number;
    minimum: number;
    maximum: number;
    color: string;
    groupingIndicatorId: string;
    sortOrder: number;
    entityType: EntityType;
    groupingIndicator: Indicator;
    optionList: OptionList;
    subcategory: Subcategory;

    data: Datum[];
    indicatorPermissions: IndicatorPermission[];
    logFrameRowIndicators: LogFrameRowIndicator[];
    sourceTokens: Token[];
    componentIndicators: ComponentIndicator[];
    tokens: Token[];
    groupIndicators: Indicator[];
    itemFields: ItemField[] = [];
    itemOptions: ItemOption[] = [];

    constructor() {
        this.indicatorId = "00000000-0000-0000-0000-000000000000";
        this.requiresSubmit = true;
        this.requiresVerify = true;
        this.requiresApprove = true;
        this.data = [];
        this.indicatorPermissions = [];
        this.logFrameRowIndicators = [];
        this.sourceTokens = [];
        this.componentIndicators = [];
        this.tokens = [];
        this.groupIndicators = [];
    }
}

export class IndicatorSearchOptions extends SearchOptions {
    q: string;
    categoryId: string;
    subcategoryId: string;
    indicatorType: IndicatorTypes;
    indicatorStatus: IndicatorStatuses;
    entityTypeId: string;
    frequency: DateTypes;
    groupingIndicatorId: string;
    createdById: string;
}

export class IndicatorSearchResponse {
    indicators: Indicator[];
    headers: PagingHeaders;
}

export class MyIndicatorSearchOptions extends SearchOptions {
    permissionType: number; // todo: enum?
    categoryId: string;
    subcategoryId: string;
}

export class IndicatorIndicatorsSearchOptions extends SearchOptions {
    indicatorId: string;
}

export class UnassignedIndicator {
    indicatorId: string;
    indicator: Indicator;
    hasEditPermissions: string;
    hasSubmitPermissions: string;
    hasApprovePermissions: string;
}

