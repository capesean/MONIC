import { SearchOptions, PagingHeaders } from './http.model';
import { LogFrame } from './logframe.model';
import { LogFrameRowTypes } from './enums.model';
import { LogFrameRowComponent } from './logframerowcomponent.model';
import { LogFrameRowIndicator } from './logframerowindicator.model';

export class LogFrameRow {
    logFrameRowId: string;
    logFrameId: string;
    rowNumber: number;
    rowType: LogFrameRowTypes;
    description: string;
    indicators: string;
    meansOfVerification: string;
    risksAndAssumptions: string;
    logFrame: LogFrame;

    logFrameRowComponents: LogFrameRowComponent[];
    logFrameRowIndicators: LogFrameRowIndicator[];

    constructor() {
        this.logFrameRowId = "00000000-0000-0000-0000-000000000000";
    }
}

export class LogFrameRowSearchOptions extends SearchOptions {
    q: string;
    logFrameId: string;
    rowType: LogFrameRowTypes;
}

export class LogFrameRowSearchResponse {
    logFrameRows: LogFrameRow[] = [];
    headers: PagingHeaders;
}
