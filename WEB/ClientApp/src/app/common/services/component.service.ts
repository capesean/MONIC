import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Component, ComponentSearchOptions, ComponentSearchResponse } from '../models/component.model';
import { SearchQuery, PagingHeaders } from '../models/http.model';

@Injectable({ providedIn: 'root' })
export class ComponentService extends SearchQuery {

    constructor(private http: HttpClient) {
        super();
    }

    search(params: ComponentSearchOptions): Observable<ComponentSearchResponse> {
        const queryParams: HttpParams = this.buildQueryParams(params);
        return this.http.get(`${environment.baseApiUrl}components`, { params: queryParams, observe: 'response' })
            .pipe(
                map(response => {
                    const headers = JSON.parse(response.headers.get("x-pagination")) as PagingHeaders;
                    const components = response.body as Component[];
                    return { components: components, headers: headers };
                })
            );
    }

    get(componentId: string): Observable<Component> {
        return this.http.get<Component>(`${environment.baseApiUrl}components/${componentId}`);
    }

    save(component: Component): Observable<Component> {
        return this.http.post<Component>(`${environment.baseApiUrl}components/${component.componentId}`, component);
    }

    delete(componentId: string): Observable<void> {
        return this.http.delete<void>(`${environment.baseApiUrl}components/${componentId}`);
    }

    sort(ids: string[]): Observable<void> {
        return this.http.post<void>(`${environment.baseApiUrl}components/sort`, ids);
    }

    saveComponentIndicators(componentId: string, indicatorIds: string[]): Observable<void> {
        return this.http.post<void>(`${environment.baseApiUrl}components/${componentId}/componentindicators`, indicatorIds);
    }

    saveTheoryOfChangeComponents(componentId: string, theoryOfChangeIds: string[]): Observable<void> {
        return this.http.post<void>(`${environment.baseApiUrl}components/${componentId}/theoryofchangecomponents`, theoryOfChangeIds);
    }

    deleteRelationshipsAsSource(componentId: string): Observable<void> {
        return this.http.delete<void>(`${environment.baseApiUrl}components/${componentId}/relationshipsassource`);
    }

    deleteRelationshipsAsTarget(componentId: string): Observable<void> {
        return this.http.delete<void>(`${environment.baseApiUrl}components/${componentId}/relationshipsastarget`);
    }

    deleteLogFrameRowComponents(componentId: string): Observable<void> {
        return this.http.delete<void>(`${environment.baseApiUrl}components/${componentId}/logframerowcomponents`);
    }

    deleteTheoryOfChangeComponents(componentId: string): Observable<void> {
        return this.http.delete<void>(`${environment.baseApiUrl}components/${componentId}/theoryofchangecomponents`);
    }

    deleteComponentIndicators(componentId: string): Observable<void> {
        return this.http.delete<void>(`${environment.baseApiUrl}components/${componentId}/componentindicators`);
    }

}
