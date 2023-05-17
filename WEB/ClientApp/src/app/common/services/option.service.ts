import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Option, OptionSearchOptions, OptionSearchResponse } from '../models/option.model';
import { SearchQuery, PagingHeaders } from '../models/http.model';

@Injectable({ providedIn: 'root' })
export class OptionService extends SearchQuery {

    constructor(private http: HttpClient) {
        super();
    }

    search(params: OptionSearchOptions): Observable<OptionSearchResponse> {
        const queryParams: HttpParams = this.buildQueryParams(params);
        return this.http.get(`${environment.baseApiUrl}options`, { params: queryParams, observe: 'response' })
            .pipe(
                map(response => {
                    const headers = JSON.parse(response.headers.get("x-pagination")) as PagingHeaders;
                    const options = response.body as Option[];
                    return { options: options, headers: headers };
                })
            );
    }

    get(optionId: string): Observable<Option> {
        return this.http.get<Option>(`${environment.baseApiUrl}options/${optionId}`);
    }

    save(option: Option): Observable<Option> {
        return this.http.post<Option>(`${environment.baseApiUrl}options/${option.optionId}`, option);
    }

    delete(optionId: string): Observable<void> {
        return this.http.delete<void>(`${environment.baseApiUrl}options/${optionId}`);
    }

    sort(fieldId: string, ids: string[]): Observable<void> {
        return this.http.post<void>(`${environment.baseApiUrl}options/sort?fieldid=${fieldId}`, ids);
    }

}
