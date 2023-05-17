import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Datum, DatumSearchOptions, DatumSearchResponse, MyDataSearchOptions, DataStatus, DataStatusOptions } from '../models/datum.model';
import { SearchQuery, PagingHeaders } from '../models/http.model';

@Injectable({ providedIn: 'root' })
export class DatumService extends SearchQuery {

    constructor(private http: HttpClient) {
        super();
    }

    search(params: DatumSearchOptions): Observable<DatumSearchResponse> {
        const queryParams: HttpParams = this.buildQueryParams(params);
        return this.http.get(`${environment.baseApiUrl}data`, { params: queryParams, observe: 'response' })
            .pipe(
                map(response => {
                    const headers = JSON.parse(response.headers.get("x-pagination")) as PagingHeaders;
                    const data = response.body as Datum[];
                    return { data: data, headers: headers };
                })
            );
    }

    get(indicatorId: string, entityId: string, dateId: string): Observable<Datum> {
        return this.http.get<Datum>(`${environment.baseApiUrl}data/${indicatorId}/${entityId}/${dateId}`);
    }

    save(datum: Datum): Observable<Datum> {
        return this.http.post<Datum>(`${environment.baseApiUrl}data/${datum.indicatorId}/${datum.entityId}/${datum.dateId}`, datum);
    }

    delete(indicatorId: string, entityId: string, dateId: string): Observable<void> {
        return this.http.delete<void>(`${environment.baseApiUrl}data/${indicatorId}/${entityId}/${dateId}`);
    }

    myData(params: MyDataSearchOptions): Observable<DatumSearchResponse> {
        const queryParams: HttpParams = this.buildQueryParams(params);
        return this.http.get<Datum[]>(`${environment.baseApiUrl}data/mydata`, { params: queryParams, observe: 'response' })
            .pipe(
                map(response => {
                    const headers = <PagingHeaders>JSON.parse(response.headers.get("x-pagination"))
                    const data = <Datum[]>response.body;
                    return { data: data, headers: headers };
                })
            );
    }

    bulkdelete(data: Datum[]): Observable<void> {
        return this.http.post<void>(`${environment.baseApiUrl}data/bulkdelete`, data);
    }

    submit(data: Datum[]): Observable<void> {
        return this.http.post<void>(`${environment.baseApiUrl}data/submit`, data);
    }

    unsubmit(data: Datum[]): Observable<void> {
        return this.http.post<void>(`${environment.baseApiUrl}data/unsubmit`, data);
    }

    approve(data: Datum[]): Observable<void> {
        return this.http.post<void>(`${environment.baseApiUrl}data/approve`, data);
    }

    unapprove(data: Datum[]): Observable<void> {
        return this.http.post<void>(`${environment.baseApiUrl}data/unapprove`, data);
    }

    status(searchOptions: DataStatusOptions): Observable<DataStatus> {
        const queryParams: HttpParams = this.buildQueryParams(searchOptions);
        return this.http.get<DataStatus>(`${environment.baseApiUrl}data/status`, { params: queryParams });
    }

}
