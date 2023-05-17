import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { LogFrameRowIndicator, LogFrameRowIndicatorSearchOptions, LogFrameRowIndicatorSearchResponse } from '../models/logframerowindicator.model';
import { SearchQuery, PagingHeaders } from '../models/http.model';

@Injectable({ providedIn: 'root' })
export class LogFrameRowIndicatorService extends SearchQuery {

    constructor(private http: HttpClient) {
        super();
    }

    search(params: LogFrameRowIndicatorSearchOptions): Observable<LogFrameRowIndicatorSearchResponse> {
        const queryParams: HttpParams = this.buildQueryParams(params);
        return this.http.get(`${environment.baseApiUrl}logframerowindicators`, { params: queryParams, observe: 'response' })
            .pipe(
                map(response => {
                    const headers = JSON.parse(response.headers.get("x-pagination")) as PagingHeaders;
                    const logFrameRowIndicators = response.body as LogFrameRowIndicator[];
                    return { logFrameRowIndicators: logFrameRowIndicators, headers: headers };
                })
            );
    }

    get(logFrameRowId: string, indicatorId: string): Observable<LogFrameRowIndicator> {
        return this.http.get<LogFrameRowIndicator>(`${environment.baseApiUrl}logframerowindicators/${logFrameRowId}/${indicatorId}`);
    }

    save(logFrameRowIndicator: LogFrameRowIndicator): Observable<LogFrameRowIndicator> {
        return this.http.post<LogFrameRowIndicator>(`${environment.baseApiUrl}logframerowindicators/${logFrameRowIndicator.logFrameRowId}/${logFrameRowIndicator.indicatorId}`, logFrameRowIndicator);
    }

    delete(logFrameRowId: string, indicatorId: string): Observable<void> {
        return this.http.delete<void>(`${environment.baseApiUrl}logframerowindicators/${logFrameRowId}/${indicatorId}`);
    }

}
