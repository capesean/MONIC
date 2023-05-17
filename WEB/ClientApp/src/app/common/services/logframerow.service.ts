import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { LogFrameRow, LogFrameRowSearchOptions, LogFrameRowSearchResponse } from '../models/logframerow.model';
import { SearchQuery, PagingHeaders } from '../models/http.model';

@Injectable({ providedIn: 'root' })
export class LogFrameRowService extends SearchQuery {

    constructor(private http: HttpClient) {
        super();
    }

    search(params: LogFrameRowSearchOptions): Observable<LogFrameRowSearchResponse> {
        const queryParams: HttpParams = this.buildQueryParams(params);
        return this.http.get(`${environment.baseApiUrl}logframerows`, { params: queryParams, observe: 'response' })
            .pipe(
                map(response => {
                    const headers = JSON.parse(response.headers.get("x-pagination")) as PagingHeaders;
                    const logFrameRows = response.body as LogFrameRow[];
                    return { logFrameRows: logFrameRows, headers: headers };
                })
            );
    }

    get(logFrameRowId: string): Observable<LogFrameRow> {
        return this.http.get<LogFrameRow>(`${environment.baseApiUrl}logframerows/${logFrameRowId}`);
    }

    save(logFrameRow: LogFrameRow, saveChildren: boolean = false): Observable<LogFrameRow> {
        return this.http.post<LogFrameRow>(`${environment.baseApiUrl}logframerows/${logFrameRow.logFrameRowId}${(saveChildren ? "?saveChildren=true" : "")}`, logFrameRow);
    }

    delete(logFrameRowId: string): Observable<void> {
        return this.http.delete<void>(`${environment.baseApiUrl}logframerows/${logFrameRowId}`);
    }

    sort(logFrameId: string, ids: string[]): Observable<void> {
        return this.http.post<void>(`${environment.baseApiUrl}logframerows/sort?logframeid=${logFrameId}`, ids);
    }

    saveLogFrameRowIndicators(logFrameRowId: string, indicatorIds: string[]): Observable<void> {
        return this.http.post<void>(`${environment.baseApiUrl}logframerows/${logFrameRowId}/logframerowindicators`, indicatorIds);
    }

    saveLogFrameRowComponents(logFrameRowId: string, componentIds: string[]): Observable<void> {
        return this.http.post<void>(`${environment.baseApiUrl}logframerows/${logFrameRowId}/logframerowcomponents`, componentIds);
    }

    deleteLogFrameRowIndicators(logFrameRowId: string): Observable<void> {
        return this.http.delete<void>(`${environment.baseApiUrl}logframerows/${logFrameRowId}/logframerowindicators`);
    }

    deleteLogFrameRowComponents(logFrameRowId: string): Observable<void> {
        return this.http.delete<void>(`${environment.baseApiUrl}logframerows/${logFrameRowId}/logframerowcomponents`);
    }

}
