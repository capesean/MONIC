import { SearchOptions, PagingHeaders } from './http.model';

export class Chart {
    chartId: string;
    name: string;
    settings: string;

    constructor() {
        this.chartId = "00000000-0000-0000-0000-000000000000";
    }
}

export class ChartSearchOptions extends SearchOptions {
    q: string;
}

export class ChartSearchResponse {
    charts: Chart[] = [];
    headers: PagingHeaders;
}
