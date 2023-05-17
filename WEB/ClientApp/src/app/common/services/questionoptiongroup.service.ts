import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { QuestionOptionGroup, QuestionOptionGroupSearchOptions, QuestionOptionGroupSearchResponse } from '../models/questionoptiongroup.model';
import { SearchQuery, PagingHeaders } from '../models/http.model';

@Injectable({ providedIn: 'root' })
export class QuestionOptionGroupService extends SearchQuery {

    constructor(private http: HttpClient) {
        super();
    }

    search(params: QuestionOptionGroupSearchOptions): Observable<QuestionOptionGroupSearchResponse> {
        const queryParams: HttpParams = this.buildQueryParams(params);
        return this.http.get(`${environment.baseApiUrl}questionoptiongroups`, { params: queryParams, observe: 'response' })
            .pipe(
                map(response => {
                    const headers = JSON.parse(response.headers.get("x-pagination")) as PagingHeaders;
                    const questionOptionGroups = response.body as QuestionOptionGroup[];
                    return { questionOptionGroups: questionOptionGroups, headers: headers };
                })
            );
    }

    get(questionOptionGroupId: string): Observable<QuestionOptionGroup> {
        return this.http.get<QuestionOptionGroup>(`${environment.baseApiUrl}questionoptiongroups/${questionOptionGroupId}`);
    }

    save(questionOptionGroup: QuestionOptionGroup): Observable<QuestionOptionGroup> {
        return this.http.post<QuestionOptionGroup>(`${environment.baseApiUrl}questionoptiongroups/${questionOptionGroup.questionOptionGroupId}`, questionOptionGroup);
    }

    delete(questionOptionGroupId: string): Observable<void> {
        return this.http.delete<void>(`${environment.baseApiUrl}questionoptiongroups/${questionOptionGroupId}`);
    }

    deleteQuestionOptions(questionOptionGroupId: string): Observable<void> {
        return this.http.delete<void>(`${environment.baseApiUrl}questionoptiongroups/${questionOptionGroupId}/questionoptions`);
    }

    deleteQuestions(questionOptionGroupId: string): Observable<void> {
        return this.http.delete<void>(`${environment.baseApiUrl}questionoptiongroups/${questionOptionGroupId}/questions`);
    }

}
