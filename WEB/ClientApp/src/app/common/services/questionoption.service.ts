import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { QuestionOption, QuestionOptionSearchOptions, QuestionOptionSearchResponse } from '../models/questionoption.model';
import { SearchQuery, PagingHeaders } from '../models/http.model';

@Injectable({ providedIn: 'root' })
export class QuestionOptionService extends SearchQuery {

    constructor(private http: HttpClient) {
        super();
    }

    search(params: QuestionOptionSearchOptions): Observable<QuestionOptionSearchResponse> {
        const queryParams: HttpParams = this.buildQueryParams(params);
        return this.http.get(`${environment.baseApiUrl}questionoptions`, { params: queryParams, observe: 'response' })
            .pipe(
                map(response => {
                    const headers = JSON.parse(response.headers.get("x-pagination")) as PagingHeaders;
                    const questionOptions = response.body as QuestionOption[];
                    return { questionOptions: questionOptions, headers: headers };
                })
            );
    }

    get(questionOptionId: string): Observable<QuestionOption> {
        return this.http.get<QuestionOption>(`${environment.baseApiUrl}questionoptions/${questionOptionId}`);
    }

    save(questionOption: QuestionOption): Observable<QuestionOption> {
        return this.http.post<QuestionOption>(`${environment.baseApiUrl}questionoptions/${questionOption.questionOptionId}`, questionOption);
    }

    delete(questionOptionId: string): Observable<void> {
        return this.http.delete<void>(`${environment.baseApiUrl}questionoptions/${questionOptionId}`);
    }

    sort(questionOptionGroupId: string, ids: string[]): Observable<void> {
        return this.http.post<void>(`${environment.baseApiUrl}questionoptions/sort?questionoptiongroupid=${questionOptionGroupId}`, ids);
    }

}
