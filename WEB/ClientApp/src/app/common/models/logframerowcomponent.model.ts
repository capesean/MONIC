import { SearchOptions, PagingHeaders } from './http.model';
import { Component } from './component.model';
import { LogFrameRow } from './logframerow.model';

export class LogFrameRowComponent {
    logFrameRowId: string;
    componentId: string;
    component: Component;
    logFrameRow: LogFrameRow;

    constructor() {
    }
}

export class LogFrameRowComponentSearchOptions extends SearchOptions {
    logFrameRowId: string;
    componentId: string;
}

export class LogFrameRowComponentSearchResponse {
    logFrameRowComponents: LogFrameRowComponent[] = [];
    headers: PagingHeaders;
}
