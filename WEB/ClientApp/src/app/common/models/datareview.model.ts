import { SearchOptions, PagingHeaders } from './http.model';
import { User } from './user.model';
import { ReviewResults, ReviewStatuses } from './enums.model';
import { DataReviewLink } from './datareviewlink.model';
import { Datum } from './datum.model';

export class DataReview {
    dataReviewId: string;
    dateUtc: Date;
    userId: string;
    reviewStatus: ReviewStatuses;
    reviewResult: ReviewResults;
    note: string;
    user: User;

    dataReviewLinks: DataReviewLink[];
    submittedData: Datum[];
    verifiedData: Datum[];
    approvedData: Datum[];
    rejectedData: Datum[];

    constructor() {
        this.dataReviewId = "00000000-0000-0000-0000-000000000000";
    }
}

export class DataReviewSearchOptions extends SearchOptions {
    q: string;
    userId: string;
    reviewStatus: ReviewStatuses;
}

export class DataReviewSearchResponse {
    dataReviews: DataReview[] = [];
    headers: PagingHeaders;
}
