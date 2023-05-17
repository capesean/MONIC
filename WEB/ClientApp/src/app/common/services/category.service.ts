import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Category, CategorySearchOptions, CategorySearchResponse } from '../models/category.model';
import { SearchQuery, PagingHeaders } from '../models/http.model';

@Injectable({ providedIn: 'root' })
export class CategoryService extends SearchQuery {

    constructor(private http: HttpClient) {
        super();
    }

    search(params: CategorySearchOptions): Observable<CategorySearchResponse> {
        const queryParams: HttpParams = this.buildQueryParams(params);
        return this.http.get(`${environment.baseApiUrl}categories`, { params: queryParams, observe: 'response' })
            .pipe(
                map(response => {
                    const headers = JSON.parse(response.headers.get("x-pagination")) as PagingHeaders;
                    const categories = response.body as Category[];
                    return { categories: categories, headers: headers };
                })
            );
    }

    get(categoryId: string): Observable<Category> {
        return this.http.get<Category>(`${environment.baseApiUrl}categories/${categoryId}`);
    }

    save(category: Category): Observable<Category> {
        return this.http.post<Category>(`${environment.baseApiUrl}categories/${category.categoryId}`, category);
    }

    delete(categoryId: string): Observable<void> {
        return this.http.delete<void>(`${environment.baseApiUrl}categories/${categoryId}`);
    }

    sort(ids: string[]): Observable<void> {
        return this.http.post<void>(`${environment.baseApiUrl}categories/sort`, ids);
    }

    deleteSubcategories(categoryId: string): Observable<void> {
        return this.http.delete<void>(`${environment.baseApiUrl}categories/${categoryId}/subcategories`);
    }

}
