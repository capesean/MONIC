import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ComponentIndicator, ComponentIndicatorSearchOptions, ComponentIndicatorSearchResponse } from '../models/componentindicator.model';
import { SearchQuery, PagingHeaders } from '../models/http.model';

@Injectable({ providedIn: 'root' })
export class ComponentIndicatorService extends SearchQuery {

    constructor(private http: HttpClient) {
        super();
    }

    search(params: ComponentIndicatorSearchOptions): Observable<ComponentIndicatorSearchResponse> {
        const queryParams: HttpParams = this.buildQueryParams(params);
        return this.http.get(`${environment.baseApiUrl}componentindicators`, { params: queryParams, observe: 'response' })
            .pipe(
                map(response => {
                    const headers = JSON.parse(response.headers.get("x-pagination")) as PagingHeaders;
                    const componentIndicators = response.body as ComponentIndicator[];
                    return { componentIndicators: componentIndicators, headers: headers };
                })
            );
    }

    get(componentId: string, indicatorId: string): Observable<ComponentIndicator> {
        return this.http.get<ComponentIndicator>(`${environment.baseApiUrl}componentindicators/${componentId}/${indicatorId}`);
    }

    save(componentIndicator: ComponentIndicator): Observable<ComponentIndicator> {
        return this.http.post<ComponentIndicator>(`${environment.baseApiUrl}componentindicators/${componentIndicator.componentId}/${componentIndicator.indicatorId}`, componentIndicator);
    }

    delete(componentId: string, indicatorId: string): Observable<void> {
        return this.http.delete<void>(`${environment.baseApiUrl}componentindicators/${componentId}/${indicatorId}`);
    }

}
