import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SkipLogicOption, SkipLogicOptionSearchOptions, SkipLogicOptionSearchResponse } from '../models/skiplogicoption.model';
import { SearchQuery, PagingHeaders } from '../models/http.model';

@Injectable({ providedIn: 'root' })
export class SkipLogicOptionService extends SearchQuery {

    constructor(private http: HttpClient) {
        super();
    }

    search(params: SkipLogicOptionSearchOptions): Observable<SkipLogicOptionSearchResponse> {
        const queryParams: HttpParams = this.buildQueryParams(params);
        return this.http.get(`${environment.baseApiUrl}skiplogicoptions`, { params: queryParams, observe: 'response' })
            .pipe(
                map(response => {
                    const headers = JSON.parse(response.headers.get("x-pagination")) as PagingHeaders;
                    const skipLogicOptions = response.body as SkipLogicOption[];
                    return { skipLogicOptions: skipLogicOptions, headers: headers };
                })
            );
    }

    get(questionId: string, checkQuestionOptionId: string): Observable<SkipLogicOption> {
        return this.http.get<SkipLogicOption>(`${environment.baseApiUrl}skiplogicoptions/${questionId}/${checkQuestionOptionId}`);
    }

    save(skipLogicOption: SkipLogicOption): Observable<SkipLogicOption> {
        return this.http.post<SkipLogicOption>(`${environment.baseApiUrl}skiplogicoptions/${skipLogicOption.questionId}/${skipLogicOption.checkQuestionOptionId}`, skipLogicOption);
    }

    delete(questionId: string, checkQuestionOptionId: string): Observable<void> {
        return this.http.delete<void>(`${environment.baseApiUrl}skiplogicoptions/${questionId}/${checkQuestionOptionId}`);
    }

}
