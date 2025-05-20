import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ItemField, ItemFieldSearchOptions, ItemFieldSearchResponse } from '../models/itemfield.model';
import { SearchQuery, PagingHeaders } from '../models/http.model';

@Injectable({ providedIn: 'root' })
export class ItemFieldService extends SearchQuery {

    constructor(private http: HttpClient) {
        super();
    }

    search(params: ItemFieldSearchOptions): Observable<ItemFieldSearchResponse> {
        const queryParams: HttpParams = this.buildQueryParams(params);
        return this.http.get(`${environment.baseApiUrl}itemfields`, { params: queryParams, observe: 'response' })
            .pipe(
                map(response => {
                    const headers = JSON.parse(response.headers.get("x-pagination")) as PagingHeaders;
                    const itemFields = response.body as ItemField[];
                    return { itemFields: itemFields, headers: headers };
                })
            );
    }

    get(itemId: string, fieldId: string): Observable<ItemField> {
        return this.http.get<ItemField>(`${environment.baseApiUrl}itemfields/${itemId}/${fieldId}`);
    }

    save(itemField: ItemField): Observable<ItemField> {
        return this.http.post<ItemField>(`${environment.baseApiUrl}itemfields/${itemField.itemId}/${itemField.fieldId}`, itemField);
    }

    delete(itemId: string, fieldId: string): Observable<void> {
        return this.http.delete<void>(`${environment.baseApiUrl}itemfields/${itemId}/${fieldId}`);
    }

}
