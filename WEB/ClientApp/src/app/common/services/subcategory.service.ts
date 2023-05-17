import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Subcategory, SubcategorySearchOptions, SubcategorySearchResponse } from '../models/subcategory.model';
import { SearchQuery, PagingHeaders } from '../models/http.model';

@Injectable({ providedIn: 'root' })
export class SubcategoryService extends SearchQuery {

    constructor(private http: HttpClient) {
        super();
    }

    search(params: SubcategorySearchOptions): Observable<SubcategorySearchResponse> {
        const queryParams: HttpParams = this.buildQueryParams(params);
        return this.http.get(`${environment.baseApiUrl}subcategories`, { params: queryParams, observe: 'response' })
            .pipe(
                map(response => {
                    const headers = JSON.parse(response.headers.get("x-pagination")) as PagingHeaders;
                    const subcategories = response.body as Subcategory[];
                    return { subcategories: subcategories, headers: headers };
                })
            );
    }

    get(subcategoryId: string): Observable<Subcategory> {
        return this.http.get<Subcategory>(`${environment.baseApiUrl}subcategories/${subcategoryId}`);
    }

    save(subcategory: Subcategory): Observable<Subcategory> {
        return this.http.post<Subcategory>(`${environment.baseApiUrl}subcategories/${subcategory.subcategoryId}`, subcategory);
    }

    delete(subcategoryId: string): Observable<void> {
        return this.http.delete<void>(`${environment.baseApiUrl}subcategories/${subcategoryId}`);
    }

    sort(categoryId: string, ids: string[]): Observable<void> {
        return this.http.post<void>(`${environment.baseApiUrl}subcategories/sort?categoryid=${categoryId}`, ids);
    }

    deleteIndicators(subcategoryId: string): Observable<void> {
        return this.http.delete<void>(`${environment.baseApiUrl}subcategories/${subcategoryId}/indicators`);
    }

}
