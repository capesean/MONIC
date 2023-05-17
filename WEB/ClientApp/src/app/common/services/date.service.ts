import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Date, DateSearchOptions, DateSearchResponse } from '../models/date.model';
import { SearchQuery, PagingHeaders } from '../models/http.model';

@Injectable({ providedIn: 'root' })
export class DateService extends SearchQuery {

    constructor(private http: HttpClient) {
        super();
    }

    search(params: DateSearchOptions): Observable<DateSearchResponse> {
        const queryParams: HttpParams = this.buildQueryParams(params);
        return this.http.get(`${environment.baseApiUrl}dates`, { params: queryParams, observe: 'response' })
            .pipe(
                map(response => {
                    const headers = JSON.parse(response.headers.get("x-pagination")) as PagingHeaders;
                    const dates = response.body as Date[];
                    return { dates: dates, headers: headers };
                })
            );
    }

    get(dateId: string): Observable<Date> {
        return this.http.get<Date>(`${environment.baseApiUrl}dates/${dateId}`);
    }

    save(date: Date): Observable<Date> {
        return this.http.post<Date>(`${environment.baseApiUrl}dates/${date.dateId}`, date);
    }

    delete(dateId: string): Observable<void> {
        return this.http.delete<void>(`${environment.baseApiUrl}dates/${dateId}`);
    }

    sort(ids: string[]): Observable<void> {
        return this.http.post<void>(`${environment.baseApiUrl}dates/sort`, ids);
    }

    deleteDatesInQuarter(dateId: string): Observable<void> {
        return this.http.delete<void>(`${environment.baseApiUrl}dates/${dateId}/datesinquarter`);
    }

    deleteDatesInYear(dateId: string): Observable<void> {
        return this.http.delete<void>(`${environment.baseApiUrl}dates/${dateId}/datesinyear`);
    }

    deleteResponses(dateId: string): Observable<void> {
        return this.http.delete<void>(`${environment.baseApiUrl}dates/${dateId}/responses`);
    }

}
