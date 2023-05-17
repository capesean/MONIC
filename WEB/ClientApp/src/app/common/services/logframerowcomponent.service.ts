import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { LogFrameRowComponent, LogFrameRowComponentSearchOptions, LogFrameRowComponentSearchResponse } from '../models/logframerowcomponent.model';
import { SearchQuery, PagingHeaders } from '../models/http.model';

@Injectable({ providedIn: 'root' })
export class LogFrameRowComponentService extends SearchQuery {

    constructor(private http: HttpClient) {
        super();
    }

    search(params: LogFrameRowComponentSearchOptions): Observable<LogFrameRowComponentSearchResponse> {
        const queryParams: HttpParams = this.buildQueryParams(params);
        return this.http.get(`${environment.baseApiUrl}logframerowcomponents`, { params: queryParams, observe: 'response' })
            .pipe(
                map(response => {
                    const headers = JSON.parse(response.headers.get("x-pagination")) as PagingHeaders;
                    const logFrameRowComponents = response.body as LogFrameRowComponent[];
                    return { logFrameRowComponents: logFrameRowComponents, headers: headers };
                })
            );
    }

    get(logFrameRowId: string, componentId: string): Observable<LogFrameRowComponent> {
        return this.http.get<LogFrameRowComponent>(`${environment.baseApiUrl}logframerowcomponents/${logFrameRowId}/${componentId}`);
    }

    save(logFrameRowComponent: LogFrameRowComponent): Observable<LogFrameRowComponent> {
        return this.http.post<LogFrameRowComponent>(`${environment.baseApiUrl}logframerowcomponents/${logFrameRowComponent.logFrameRowId}/${logFrameRowComponent.componentId}`, logFrameRowComponent);
    }

    delete(logFrameRowId: string, componentId: string): Observable<void> {
        return this.http.delete<void>(`${environment.baseApiUrl}logframerowcomponents/${logFrameRowId}/${componentId}`);
    }

}
