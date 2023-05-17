import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response, ResponseSearchOptions, ResponseSearchResponse } from '../models/response.model';
import { SearchQuery, PagingHeaders } from '../models/http.model';
import { DownloadModel } from '../models/download.model';
import { DownloadService } from './download.service';

@Injectable({ providedIn: 'root' })
export class ResponseService extends SearchQuery {

    constructor(private http: HttpClient, private downloadService: DownloadService) {
        super();
    }

    search(params: ResponseSearchOptions): Observable<ResponseSearchResponse> {
        const queryParams: HttpParams = this.buildQueryParams(params);
        return this.http.get(`${environment.baseApiUrl}responses`, { params: queryParams, observe: 'response' })
            .pipe(
                map(response => {
                    const headers = JSON.parse(response.headers.get("x-pagination")) as PagingHeaders;
                    const responses = response.body as Response[];
                    return { responses: responses, headers: headers };
                })
            );
    }

    get(responseId: string): Observable<Response> {
        return this.http.get<Response>(`${environment.baseApiUrl}responses/${responseId}`);
    }

    save(response: Response): Observable<Response> {
        return this.http.post<Response>(`${environment.baseApiUrl}responses/${response.responseId}`, response);
    }

    delete(responseId: string): Observable<void> {
        return this.http.delete<void>(`${environment.baseApiUrl}responses/${responseId}`);
    }

    deleteAnswers(responseId: string): Observable<void> {
        return this.http.delete<void>(`${environment.baseApiUrl}responses/${responseId}/answers`);
    }

    unsubmit(responseId: string): Observable<Response> {
        return this.http.post<Response>(`${environment.baseApiUrl}responses/${responseId}/unsubmit`, undefined);
    }

    recalculate(responseId: string): Observable<Response> {
        return this.http.post<Response>(`${environment.baseApiUrl}responses/${responseId}/recalculate`, undefined);
    }
}
