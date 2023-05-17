import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EntityPermission, EntityPermissionSearchOptions, EntityPermissionSearchResponse } from '../models/entitypermission.model';
import { SearchQuery, PagingHeaders } from '../models/http.model';

@Injectable({ providedIn: 'root' })
export class EntityPermissionService extends SearchQuery {

    constructor(private http: HttpClient) {
        super();
    }

    search(params: EntityPermissionSearchOptions): Observable<EntityPermissionSearchResponse> {
        const queryParams: HttpParams = this.buildQueryParams(params);
        return this.http.get(`${environment.baseApiUrl}entitypermissions`, { params: queryParams, observe: 'response' })
            .pipe(
                map(response => {
                    const headers = JSON.parse(response.headers.get("x-pagination")) as PagingHeaders;
                    const entityPermissions = response.body as EntityPermission[];
                    return { entityPermissions: entityPermissions, headers: headers };
                })
            );
    }

    get(entityPermissionId: string): Observable<EntityPermission> {
        return this.http.get<EntityPermission>(`${environment.baseApiUrl}entitypermissions/${entityPermissionId}`);
    }

    save(entityPermission: EntityPermission): Observable<EntityPermission> {
        return this.http.post<EntityPermission>(`${environment.baseApiUrl}entitypermissions/${entityPermission.entityPermissionId}`, entityPermission);
    }

    delete(entityPermissionId: string): Observable<void> {
        return this.http.delete<void>(`${environment.baseApiUrl}entitypermissions/${entityPermissionId}`);
    }

}
