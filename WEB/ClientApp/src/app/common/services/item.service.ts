import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Item, ItemSearchOptions, ItemSearchResponse } from '../models/item.model';
import { SearchQuery, PagingHeaders } from '../models/http.model';

@Injectable({ providedIn: 'root' })
export class ItemService extends SearchQuery {

    constructor(private http: HttpClient) {
        super();
    }

    search(params: ItemSearchOptions): Observable<ItemSearchResponse> {
        const queryParams: HttpParams = this.buildQueryParams(params);
        return this.http.get(`${environment.baseApiUrl}items`, { params: queryParams, observe: 'response' })
            .pipe(
                map(response => {
                    const headers = JSON.parse(response.headers.get("x-pagination")) as PagingHeaders;
                    const items = response.body as Item[];
                    return { items: items, headers: headers };
                })
            );
    }

    get(itemId: string): Observable<Item> {
        return this.http.get<Item>(`${environment.baseApiUrl}items/${itemId}`);
    }

    save(item: Item): Observable<Item> {
        return this.http.post<Item>(`${environment.baseApiUrl}items/${item.itemId}`, item);
    }

    delete(itemId: string): Observable<void> {
        return this.http.delete<void>(`${environment.baseApiUrl}items/${itemId}`);
    }

    deleteOptionValues(itemId: string): Observable<void> {
        return this.http.delete<void>(`${environment.baseApiUrl}items/${itemId}/optionvalues`);
    }

    deleteDocuments(itemId: string): Observable<void> {
        return this.http.delete<void>(`${environment.baseApiUrl}items/${itemId}/documents`);
    }

}
