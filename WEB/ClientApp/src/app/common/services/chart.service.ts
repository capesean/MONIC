import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Chart, ChartSearchOptions, ChartSearchResponse } from '../models/chart.model';
import { SearchQuery, PagingHeaders } from '../models/http.model';
import { Datum } from '../models/datum.model';
import { Entity } from '../models/entity.model';
import { AppDate } from '../models/date.model';

@Injectable({ providedIn: 'root' })
export class ChartService extends SearchQuery {

    constructor(private http: HttpClient) {
        super();
    }

    search(params: ChartSearchOptions): Observable<ChartSearchResponse> {
        const queryParams: HttpParams = this.buildQueryParams(params);
        return this.http.get(`${environment.baseApiUrl}charts`, { params: queryParams, observe: 'response' })
            .pipe(
                map(response => {
                    const headers = JSON.parse(response.headers.get("x-pagination")) as PagingHeaders;
                    const charts = response.body as Chart[];
                    return { charts: charts, headers: headers };
                })
            );
    }

    get(chartId: string): Observable<Chart> {
        return this.http.get<Chart>(`${environment.baseApiUrl}charts/${chartId}`);
    }

    save(chart: Chart): Observable<Chart> {
        return this.http.post<Chart>(`${environment.baseApiUrl}charts/${chart.chartId}`, chart);
    }

    delete(chartId: string): Observable<void> {
        return this.http.delete<void>(`${environment.baseApiUrl}charts/${chartId}`);
    }

    getData(settings: ChartSettings): Observable<ChartData> {
        return this.http.post<ChartData>(`${environment.baseApiUrl}charts/data`, settings);
    }

}

export class ChartSettings {
    indicatorId: string;
}

export class ChartData {
    data: Datum[];
    entities: Entity[];
    dates: AppDate[];
}
