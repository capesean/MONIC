import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { QuestionSummary, QuestionSummarySearchOptions, QuestionSummarySearchResponse } from '../models/questionsummary.model';
import { SearchQuery, PagingHeaders } from '../models/http.model';

@Injectable({ providedIn: 'root' })
export class QuestionSummaryService extends SearchQuery {

    constructor(private http: HttpClient) {
        super();
    }

    search(params: QuestionSummarySearchOptions): Observable<QuestionSummarySearchResponse> {
        const queryParams: HttpParams = this.buildQueryParams(params);
        return this.http.get(`${environment.baseApiUrl}questionsummaries`, { params: queryParams, observe: 'response' })
            .pipe(
                map(response => {
                    const headers = JSON.parse(response.headers.get("x-pagination")) as PagingHeaders;
                    const questionSummaries = response.body as QuestionSummary[];
                    return { questionSummaries: questionSummaries, headers: headers };
                })
            );
    }

    get(questionId: string, dateId: string): Observable<QuestionSummary> {
        return this.http.get<QuestionSummary>(`${environment.baseApiUrl}questionsummaries/${questionId}/${dateId}`);
    }

    save(questionSummary: QuestionSummary): Observable<QuestionSummary> {
        return this.http.post<QuestionSummary>(`${environment.baseApiUrl}questionsummaries/${questionSummary.questionId}/${questionSummary.dateId}`, questionSummary);
    }

    delete(questionId: string, dateId: string): Observable<void> {
        return this.http.delete<void>(`${environment.baseApiUrl}questionsummaries/${questionId}/${dateId}`);
    }

}
