import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Field, FieldSearchOptions, FieldSearchResponse } from '../models/field.model';
import { SearchQuery, PagingHeaders } from '../models/http.model';

@Injectable({ providedIn: 'root' })
export class FieldService extends SearchQuery {

    constructor(private http: HttpClient) {
        super();
    }

    search(params: FieldSearchOptions): Observable<FieldSearchResponse> {
        const queryParams: HttpParams = this.buildQueryParams(params);
        return this.http.get(`${environment.baseApiUrl}fields`, { params: queryParams, observe: 'response' })
            .pipe(
                map(response => {
                    const headers = JSON.parse(response.headers.get("x-pagination")) as PagingHeaders;
                    const fields = response.body as Field[];
                    return { fields: fields, headers: headers };
                })
            );
    }

    get(fieldId: string): Observable<Field> {
        return this.http.get<Field>(`${environment.baseApiUrl}fields/${fieldId}`);
    }

    save(field: Field): Observable<Field> {
        return this.http.post<Field>(`${environment.baseApiUrl}fields/${field.fieldId}`, field);
    }

    delete(fieldId: string): Observable<void> {
        return this.http.delete<void>(`${environment.baseApiUrl}fields/${fieldId}`);
    }

    sort(ids: string[]): Observable<void> {
        return this.http.post<void>(`${environment.baseApiUrl}fields/sort`, ids);
    }

}
