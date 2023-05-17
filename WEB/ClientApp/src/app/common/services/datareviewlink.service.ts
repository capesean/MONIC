import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DataReviewLink, DataReviewLinkSearchOptions, DataReviewLinkSearchResponse } from '../models/datareviewlink.model';
import { SearchQuery, PagingHeaders } from '../models/http.model';

@Injectable({ providedIn: 'root' })
export class DataReviewLinkService extends SearchQuery {

    constructor(private http: HttpClient) {
        super();
    }

    search(params: DataReviewLinkSearchOptions): Observable<DataReviewLinkSearchResponse> {
        const queryParams: HttpParams = this.buildQueryParams(params);
        return this.http.get(`${environment.baseApiUrl}datareviewlinks`, { params: queryParams, observe: 'response' })
            .pipe(
                map(response => {
                    const headers = JSON.parse(response.headers.get("x-pagination")) as PagingHeaders;
                    const dataReviewLinks = response.body as DataReviewLink[];
                    return { dataReviewLinks: dataReviewLinks, headers: headers };
                })
            );
    }

    get(indicatorId: string, entityId: string, dateId: string, dataReviewId: string): Observable<DataReviewLink> {
        return this.http.get<DataReviewLink>(`${environment.baseApiUrl}datareviewlinks/${indicatorId}/${entityId}/${dateId}/${dataReviewId}`);
    }

    save(dataReviewLink: DataReviewLink): Observable<DataReviewLink> {
        return this.http.post<DataReviewLink>(`${environment.baseApiUrl}datareviewlinks/${dataReviewLink.indicatorId}/${dataReviewLink.entityId}/${dataReviewLink.dateId}/${dataReviewLink.dataReviewId}`, dataReviewLink);
    }

    delete(indicatorId: string, entityId: string, dateId: string, dataReviewId: string): Observable<void> {
        return this.http.delete<void>(`${environment.baseApiUrl}datareviewlinks/${indicatorId}/${entityId}/${dateId}/${dataReviewId}`);
    }

}
