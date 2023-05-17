import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AnswerOption, AnswerOptionSearchOptions, AnswerOptionSearchResponse } from '../models/answeroption.model';
import { SearchQuery, PagingHeaders } from '../models/http.model';

@Injectable({ providedIn: 'root' })
export class AnswerOptionService extends SearchQuery {

    constructor(private http: HttpClient) {
        super();
    }

    search(params: AnswerOptionSearchOptions): Observable<AnswerOptionSearchResponse> {
        const queryParams: HttpParams = this.buildQueryParams(params);
        return this.http.get(`${environment.baseApiUrl}answeroptions`, { params: queryParams, observe: 'response' })
            .pipe(
                map(response => {
                    const headers = JSON.parse(response.headers.get("x-pagination")) as PagingHeaders;
                    const answerOptions = response.body as AnswerOption[];
                    return { answerOptions: answerOptions, headers: headers };
                })
            );
    }

    get(answerId: string, questionOptionId: string): Observable<AnswerOption> {
        return this.http.get<AnswerOption>(`${environment.baseApiUrl}answeroptions/${answerId}/${questionOptionId}`);
    }

    save(answerOption: AnswerOption): Observable<AnswerOption> {
        return this.http.post<AnswerOption>(`${environment.baseApiUrl}answeroptions/${answerOption.answerId}/${answerOption.questionOptionId}`, answerOption);
    }

    delete(answerId: string, questionOptionId: string): Observable<void> {
        return this.http.delete<void>(`${environment.baseApiUrl}answeroptions/${answerId}/${questionOptionId}`);
    }

}
