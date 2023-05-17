import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Answer, AnswerSearchOptions, AnswerSearchResponse } from '../models/answer.model';
import { SearchQuery, PagingHeaders } from '../models/http.model';

@Injectable({ providedIn: 'root' })
export class AnswerService extends SearchQuery {

    constructor(private http: HttpClient) {
        super();
    }

    search(params: AnswerSearchOptions): Observable<AnswerSearchResponse> {
        const queryParams: HttpParams = this.buildQueryParams(params);
        return this.http.get(`${environment.baseApiUrl}answers`, { params: queryParams, observe: 'response' })
            .pipe(
                map(response => {
                    const headers = JSON.parse(response.headers.get("x-pagination")) as PagingHeaders;
                    const answers = response.body as Answer[];
                    return { answers: answers, headers: headers };
                })
            );
    }

    get(answerId: string): Observable<Answer> {
        return this.http.get<Answer>(`${environment.baseApiUrl}answers/${answerId}`);
    }

    save(answer: Answer): Observable<Answer> {
        return this.http.post<Answer>(`${environment.baseApiUrl}answers/${answer.answerId}`, answer);
    }

    delete(answerId: string): Observable<void> {
        return this.http.delete<void>(`${environment.baseApiUrl}answers/${answerId}`);
    }

    deleteAnswerOptions(answerId: string): Observable<void> {
        return this.http.delete<void>(`${environment.baseApiUrl}answers/${answerId}/answeroptions`);
    }

}
