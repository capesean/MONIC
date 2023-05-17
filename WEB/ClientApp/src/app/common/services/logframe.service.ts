import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { LogFrame, LogFrameSearchOptions, LogFrameSearchResponse } from '../models/logframe.model';
import { SearchQuery, PagingHeaders } from '../models/http.model';

@Injectable({ providedIn: 'root' })
export class LogFrameService extends SearchQuery {

    constructor(private http: HttpClient) {
        super();
    }

    search(params: LogFrameSearchOptions): Observable<LogFrameSearchResponse> {
        const queryParams: HttpParams = this.buildQueryParams(params);
        return this.http.get(`${environment.baseApiUrl}logframes`, { params: queryParams, observe: 'response' })
            .pipe(
                map(response => {
                    const headers = JSON.parse(response.headers.get("x-pagination")) as PagingHeaders;
                    const logFrames = response.body as LogFrame[];
                    return { logFrames: logFrames, headers: headers };
                })
            );
    }

    get(logFrameId: string): Observable<LogFrame> {
        return this.http.get<LogFrame>(`${environment.baseApiUrl}logframes/${logFrameId}`);
    }

    save(logFrame: LogFrame): Observable<LogFrame> {
        return this.http.post<LogFrame>(`${environment.baseApiUrl}logframes/${logFrame.logFrameId}`, logFrame);
    }

    delete(logFrameId: string): Observable<void> {
        return this.http.delete<void>(`${environment.baseApiUrl}logframes/${logFrameId}`);
    }

    deleteLogFrameRows(logFrameId: string): Observable<void> {
        return this.http.delete<void>(`${environment.baseApiUrl}logframes/${logFrameId}/logframerows`);
    }

}
