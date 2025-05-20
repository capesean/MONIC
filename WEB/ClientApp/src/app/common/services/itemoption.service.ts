import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ItemOption, ItemOptionSearchOptions, ItemOptionSearchResponse } from '../models/itemoption.model';
import { SearchQuery, PagingHeaders } from '../models/http.model';

@Injectable({ providedIn: 'root' })
export class ItemOptionService extends SearchQuery {

    constructor(private http: HttpClient) {
        super();
    }

    search(params: ItemOptionSearchOptions): Observable<ItemOptionSearchResponse> {
        const queryParams: HttpParams = this.buildQueryParams(params);
        return this.http.get(`${environment.baseApiUrl}itemoptions`, { params: queryParams, observe: 'response' })
            .pipe(
                map(response => {
                    const headers = JSON.parse(response.headers.get("x-pagination")) as PagingHeaders;
                    const itemOptions = response.body as ItemOption[];
                    return { itemOptions: itemOptions, headers: headers };
                })
            );
    }

    get(itemId: string, optionId: string): Observable<ItemOption> {
        return this.http.get<ItemOption>(`${environment.baseApiUrl}itemoptions/${itemId}/${optionId}`);
    }

    save(itemOption: ItemOption): Observable<ItemOption> {
        return this.http.post<ItemOption>(`${environment.baseApiUrl}itemoptions/${itemOption.itemId}/${itemOption.optionId}`, itemOption);
    }

    delete(itemId: string, optionId: string): Observable<void> {
        return this.http.delete<void>(`${environment.baseApiUrl}itemoptions/${itemId}/${optionId}`);
    }

}
