import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FieldValue, FieldValueSearchOptions, FieldValueSearchResponse } from '../models/fieldvalue.model';
import { SearchQuery, PagingHeaders } from '../models/http.model';

@Injectable({ providedIn: 'root' })
export class FieldValueService extends SearchQuery {

    constructor(private http: HttpClient) {
        super();
    }

    search(params: FieldValueSearchOptions): Observable<FieldValueSearchResponse> {
        const queryParams: HttpParams = this.buildQueryParams(params);
        return this.http.get(`${environment.baseApiUrl}fieldvalues`, { params: queryParams, observe: 'response' })
            .pipe(
                map(response => {
                    const headers = JSON.parse(response.headers.get("x-pagination")) as PagingHeaders;
                    const fieldValues = response.body as FieldValue[];
                    return { fieldValues: fieldValues, headers: headers };
                })
            );
    }

    get(itemId: string, fieldId: string): Observable<FieldValue> {
        return this.http.get<FieldValue>(`${environment.baseApiUrl}fieldvalues/${itemId}/${fieldId}`);
    }

    save(fieldValue: FieldValue): Observable<FieldValue> {
        return this.http.post<FieldValue>(`${environment.baseApiUrl}fieldvalues/${fieldValue.itemId}/${fieldValue.fieldId}`, fieldValue);
    }

    delete(itemId: string, fieldId: string): Observable<void> {
        return this.http.delete<void>(`${environment.baseApiUrl}fieldvalues/${itemId}/${fieldId}`);
    }

}
