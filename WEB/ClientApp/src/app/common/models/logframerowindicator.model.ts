import { SearchOptions, PagingHeaders } from './http.model';
import { Indicator } from './indicator.model';
import { LogFrameRow } from './logframerow.model';

export class LogFrameRowIndicator {
    logFrameRowId: string;
    indicatorId: string;
    indicator: Indicator;
    logFrameRow: LogFrameRow;

    constructor() {
    }
}

export class LogFrameRowIndicatorSearchOptions extends SearchOptions {
    logFrameRowId: string;
    indicatorId: string;
    logFrameId: string;
}

export class LogFrameRowIndicatorSearchResponse {
    logFrameRowIndicators: LogFrameRowIndicator[] = [];
    headers: PagingHeaders;
}
