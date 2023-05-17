import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EntityType, EntityTypeSearchOptions, EntityTypeSearchResponse } from '../models/entitytype.model';
import { SearchQuery, PagingHeaders } from '../models/http.model';

@Injectable({ providedIn: 'root' })
export class EntityTypeService extends SearchQuery {

    constructor(private http: HttpClient) {
        super();
    }

    search(params: EntityTypeSearchOptions): Observable<EntityTypeSearchResponse> {
        const queryParams: HttpParams = this.buildQueryParams(params);
        return this.http.get(`${environment.baseApiUrl}entitytypes`, { params: queryParams, observe: 'response' })
            .pipe(
                map(response => {
                    const headers = JSON.parse(response.headers.get("x-pagination")) as PagingHeaders;
                    const entityTypes = response.body as EntityType[];
                    return { entityTypes: entityTypes, headers: headers };
                })
            );
    }

    get(entityTypeId: string): Observable<EntityType> {
        return this.http.get<EntityType>(`${environment.baseApiUrl}entitytypes/${entityTypeId}`);
    }

    save(entityType: EntityType): Observable<EntityType> {
        return this.http.post<EntityType>(`${environment.baseApiUrl}entitytypes/${entityType.entityTypeId}`, entityType);
    }

    delete(entityTypeId: string): Observable<void> {
        return this.http.delete<void>(`${environment.baseApiUrl}entitytypes/${entityTypeId}`);
    }

    sort(ids: string[]): Observable<void> {
        return this.http.post<void>(`${environment.baseApiUrl}entitytypes/sort`, ids);
    }

    deleteEntities(entityTypeId: string): Observable<void> {
        return this.http.delete<void>(`${environment.baseApiUrl}entitytypes/${entityTypeId}/entities`);
    }

    deleteQuestionnaires(entityTypeId: string): Observable<void> {
        return this.http.delete<void>(`${environment.baseApiUrl}entitytypes/${entityTypeId}/questionnaires`);
    }

}
