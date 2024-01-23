import { SearchOptions, PagingHeaders } from './http.model';
import { LogFrameRow } from './logframerow.model';

export class LogFrame {
    logFrameId: string;
    name: string;

    logFrameRows: LogFrameRow[];

    constructor() {
        this.logFrameId = "00000000-0000-0000-0000-000000000000";
        this.logFrameRows = [];
    }
}

export class LogFrameSearchOptions extends SearchOptions {
    q: string;
}

export class LogFrameSearchResponse {
    logFrames: LogFrame[] = [];
    headers: PagingHeaders;
}
