import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Entity, EntitySearchOptions, EntitySearchResponse } from '../models/entity.model';
import { SearchQuery, PagingHeaders } from '../models/http.model';
import { Roles } from '../models/enums.model';

@Injectable({ providedIn: 'root' })
export class EntityService extends SearchQuery {

    constructor(private http: HttpClient) {
        super();
    }

    search(params: EntitySearchOptions): Observable<EntitySearchResponse> {
        return this.http.post(`${environment.baseApiUrl}entities`, params, { observe: 'response' })
            .pipe(
                map(response => {
                    const headers = JSON.parse(response.headers.get("x-pagination")) as PagingHeaders;
                    const entities = response.body as Entity[];
                    return { entities: entities, headers: headers };
                })
            );
    }

    get(entityId: string, role: Roles = undefined): Observable<Entity> {
        return this.http.get<Entity>(`${environment.baseApiUrl}entities/${entityId}${(role !== undefined ? "?role=" + role : "")}`);
    }

    save(entity: Entity): Observable<Entity> {
        return this.http.post<Entity>(`${environment.baseApiUrl}entities/${entity.entityId}`, entity);
    }

    delete(entityId: string): Observable<void> {
        return this.http.delete<void>(`${environment.baseApiUrl}entities/${entityId}`);
    }

    deleteEntityPermissions(entityId: string): Observable<void> {
        return this.http.delete<void>(`${environment.baseApiUrl}entities/${entityId}/entitypermissions`);
    }

    setDisabled(entityId: string, value: boolean): Observable<void> {
        return this.http.post<void>(`${environment.baseApiUrl}entities/${entityId}/setdisabled/${value}`, undefined);
    }

    deleteResponses(entityId: string): Observable<void> {
        return this.http.delete<void>(`${environment.baseApiUrl}entities/${entityId}/responses`);
    }

}
