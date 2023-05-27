import { SearchOptions, PagingHeaders } from './http.model';
import { Component } from './component.model';
import { Indicator } from './indicator.model';

export class ComponentIndicator {
    componentId: string;
    indicatorId: string;
    component: Component;
    indicator: Indicator;

    constructor() {
    }
}

export class ComponentIndicatorSearchOptions extends SearchOptions {
    componentId: string;
    indicatorId: string;
}

export class ComponentIndicatorSearchResponse {
    componentIndicators: ComponentIndicator[] = [];
    headers: PagingHeaders;
}
