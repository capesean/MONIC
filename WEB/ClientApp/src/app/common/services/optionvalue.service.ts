import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { OptionValue, OptionValueSearchOptions, OptionValueSearchResponse } from '../models/optionvalue.model';
import { SearchQuery, PagingHeaders } from '../models/http.model';

@Injectable({ providedIn: 'root' })
export class OptionValueService extends SearchQuery {

    constructor(private http: HttpClient) {
        super();
    }

    search(params: OptionValueSearchOptions): Observable<OptionValueSearchResponse> {
        const queryParams: HttpParams = this.buildQueryParams(params);
        return this.http.get(`${environment.baseApiUrl}optionvalues`, { params: queryParams, observe: 'response' })
            .pipe(
                map(response => {
                    const headers = JSON.parse(response.headers.get("x-pagination")) as PagingHeaders;
                    const optionValues = response.body as OptionValue[];
                    return { optionValues: optionValues, headers: headers };
                })
            );
    }

    get(itemId: string, optionId: string): Observable<OptionValue> {
        return this.http.get<OptionValue>(`${environment.baseApiUrl}optionvalues/${itemId}/${optionId}`);
    }

    save(optionValue: OptionValue): Observable<OptionValue> {
        return this.http.post<OptionValue>(`${environment.baseApiUrl}optionvalues/${optionValue.itemId}/${optionValue.optionId}`, optionValue);
    }

    delete(itemId: string, optionId: string): Observable<void> {
        return this.http.delete<void>(`${environment.baseApiUrl}optionvalues/${itemId}/${optionId}`);
    }

}
