import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Question, QuestionSearchOptions, QuestionSearchResponse } from '../models/question.model';
import { SearchQuery, PagingHeaders } from '../models/http.model';

@Injectable({ providedIn: 'root' })
export class QuestionService extends SearchQuery {

    constructor(private http: HttpClient) {
        super();
    }

    search(params: QuestionSearchOptions): Observable<QuestionSearchResponse> {
        const queryParams: HttpParams = this.buildQueryParams(params);
        return this.http.get(`${environment.baseApiUrl}questions`, { params: queryParams, observe: 'response' })
            .pipe(
                map(response => {
                    const headers = JSON.parse(response.headers.get("x-pagination")) as PagingHeaders;
                    const questions = response.body as Question[];
                    return { questions: questions, headers: headers };
                })
            );
    }

    get(questionId: string): Observable<Question> {
        return this.http.get<Question>(`${environment.baseApiUrl}questions/${questionId}`);
    }

    save(question: Question): Observable<Question> {
        return this.http.post<Question>(`${environment.baseApiUrl}questions/${question.questionId}`, question);
    }

    delete(questionId: string): Observable<void> {
        return this.http.delete<void>(`${environment.baseApiUrl}questions/${questionId}`);
    }

    sort(sectionId: string, ids: string[]): Observable<void> {
        return this.http.post<void>(`${environment.baseApiUrl}questions/sort?sectionid=${sectionId}`, ids);
    }

    deleteAnswers(questionId: string): Observable<void> {
        return this.http.delete<void>(`${environment.baseApiUrl}questions/${questionId}/answers`);
    }

    deleteQuestionSummaries(questionId: string): Observable<void> {
        return this.http.delete<void>(`${environment.baseApiUrl}questions/${questionId}/questionsummaries`);
    }

}
