import { SearchOptions, PagingHeaders } from './http.model';
import { EntityType } from './entitytype.model';
import { Subcategory } from './subcategory.model';
import { User } from './user.model';
import { AggregationTypes, DataTypes, DateTypes, IndicatorStatuses, IndicatorTypes } from './enums.model';
import { Datum } from './datum.model';
import { IndicatorPermission } from './indicatorpermission.model';
import { LogFrameRowIndicator } from './logframerowindicator.model';
import { Token } from './token.model';
import { IHasFields } from './ihasfields.model';
import { FieldValue } from './fieldvalue.model';
import { OptionValue } from './optionvalue.model';

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
    reportingFrequency: DateTypes;
    dateAggregationType: AggregationTypes;
    dataType: DataTypes;
    decimalPlaces: number;
    sortOrder: number;
    entityType: EntityType;
    subcategory: Subcategory;

    data: Datum[];
    indicatorPermissions: IndicatorPermission[];
    logFrameRowIndicators: LogFrameRowIndicator[];
    sourceTokens: Token[];
    tokens: Token[];
    fieldValues: FieldValue[] = [];
    optionValues: OptionValue[] = [];

    constructor() {
        this.indicatorId = "00000000-0000-0000-0000-000000000000";
        this.requiresSubmit = true;
        this.requiresVerify = true;
        this.requiresApprove = true;
    }
}

export class IndicatorSearchOptions extends SearchOptions {
    q: string;
    categoryId: string;
    subcategoryId: string;
    indicatorType: IndicatorTypes;
    indicatorStatus: IndicatorStatuses;
    entityTypeId: string;
    reportingFrequency: DateTypes;
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

