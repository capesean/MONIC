import { SearchOptions, PagingHeaders } from './http.model';
import { AppDate } from './date.model';
import { Indicator } from './indicator.model';

export class IndicatorDate {
    indicatorId: string;
    dateId: string;
    date: AppDate;
    indicator: Indicator;

    constructor() {
    }
}

export class IndicatorDateSearchOptions extends SearchOptions {
    indicatorId: string;
    dateId: string;
}

export class IndicatorDateSearchResponse {
    indicatorDates: IndicatorDate[] = [];
    headers: PagingHeaders;
}
