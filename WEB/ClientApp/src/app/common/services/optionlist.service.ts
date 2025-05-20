import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { OptionList, OptionListSearchOptions, OptionListSearchResponse } from '../models/optionlist.model';
import { SearchQuery, PagingHeaders } from '../models/http.model';

@Injectable({ providedIn: 'root' })
export class OptionListService extends SearchQuery {

    constructor(private http: HttpClient) {
        super();
    }

    search(params: OptionListSearchOptions): Observable<OptionListSearchResponse> {
        const queryParams: HttpParams = this.buildQueryParams(params);
        return this.http.get(`${environment.baseApiUrl}optionlists`, { params: queryParams, observe: 'response' })
            .pipe(
                map(response => {
                    const headers = JSON.parse(response.headers.get("x-pagination")) as PagingHeaders;
                    const optionLists = response.body as OptionList[];
                    return { optionLists: optionLists, headers: headers };
                })
            );
    }

    get(optionListId: string): Observable<OptionList> {
        return this.http.get<OptionList>(`${environment.baseApiUrl}optionlists/${optionListId}`);
    }

    save(optionList: OptionList): Observable<OptionList> {
        return this.http.post<OptionList>(`${environment.baseApiUrl}optionlists/${optionList.optionListId}`, optionList);
    }

    delete(optionListId: string): Observable<void> {
        return this.http.delete<void>(`${environment.baseApiUrl}optionlists/${optionListId}`);
    }

    deleteOptions(optionListId: string): Observable<void> {
        return this.http.delete<void>(`${environment.baseApiUrl}optionlists/${optionListId}/options`);
    }

}
