import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DataReview, DataReviewSearchOptions, DataReviewSearchResponse } from '../models/datareview.model';
import { SearchQuery, PagingHeaders } from '../models/http.model';

@Injectable({ providedIn: 'root' })
export class DataReviewService extends SearchQuery {

    constructor(private http: HttpClient) {
        super();
    }

    search(params: DataReviewSearchOptions): Observable<DataReviewSearchResponse> {
        const queryParams: HttpParams = this.buildQueryParams(params);
        return this.http.get(`${environment.baseApiUrl}datareviews`, { params: queryParams, observe: 'response' })
            .pipe(
                map(response => {
                    const headers = JSON.parse(response.headers.get("x-pagination")) as PagingHeaders;
                    const dataReviews = response.body as DataReview[];
                    return { dataReviews: dataReviews, headers: headers };
                })
            );
    }

    get(dataReviewId: string): Observable<DataReview> {
        return this.http.get<DataReview>(`${environment.baseApiUrl}datareviews/${dataReviewId}`);
    }

    save(dataReview: DataReview): Observable<DataReview> {
        return this.http.post<DataReview>(`${environment.baseApiUrl}datareviews/${dataReview.dataReviewId}`, dataReview);
    }

    delete(dataReviewId: string): Observable<void> {
        return this.http.delete<void>(`${environment.baseApiUrl}datareviews/${dataReviewId}`);
    }

}
