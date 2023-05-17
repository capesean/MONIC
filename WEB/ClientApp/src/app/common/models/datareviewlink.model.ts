import { SearchOptions, PagingHeaders } from './http.model';
import { DataReview } from './datareview.model';
import { Datum } from './datum.model';

export class DataReviewLink {
    indicatorId: string;
    entityId: string;
    dateId: string;
    dataReviewId: string;
    dataReview: DataReview;
    datum: Datum;

    constructor() {
    }
}

export class DataReviewLinkSearchOptions extends SearchOptions {
    indicatorId: string;
    entityId: string;
    dateId: string;
    dataReviewId: string;
}

export class DataReviewLinkSearchResponse {
    dataReviewLinks: DataReviewLink[] = [];
    headers: PagingHeaders;
}
