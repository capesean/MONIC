import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IndicatorDate, IndicatorDateSearchOptions, IndicatorDateSearchResponse } from '../models/indicatordate.model';
import { SearchQuery, PagingHeaders } from '../models/http.model';

@Injectable({ providedIn: 'root' })
export class IndicatorDateService extends SearchQuery {

    constructor(private http: HttpClient) {
        super();
    }

    search(params: IndicatorDateSearchOptions): Observable<IndicatorDateSearchResponse> {
        const queryParams: HttpParams = this.buildQueryParams(params);
        return this.http.get(`${environment.baseApiUrl}indicatordates`, { params: queryParams, observe: 'response' })
            .pipe(
                map(response => {
                    const headers = JSON.parse(response.headers.get("x-pagination")) as PagingHeaders;
                    const indicatorDates = response.body as IndicatorDate[];
                    return { indicatorDates: indicatorDates, headers: headers };
                })
            );
    }

    get(indicatorId: string, dateId: string): Observable<IndicatorDate> {
        return this.http.get<IndicatorDate>(`${environment.baseApiUrl}indicatordates/${indicatorId}/${dateId}`);
    }

    save(indicatorDate: IndicatorDate): Observable<IndicatorDate> {
        return this.http.post<IndicatorDate>(`${environment.baseApiUrl}indicatordates/${indicatorDate.indicatorId}/${indicatorDate.dateId}`, indicatorDate);
    }

    delete(indicatorId: string, dateId: string): Observable<void> {
        return this.http.delete<void>(`${environment.baseApiUrl}indicatordates/${indicatorId}/${dateId}`);
    }

}
