import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IndicatorPermission, IndicatorPermissionSearchOptions, IndicatorPermissionSearchResponse, AssignPermissionModel } from '../models/indicatorpermission.model';import { SearchQuery, PagingHeaders } from '../models/http.model';

@Injectable({ providedIn: 'root' })
export class IndicatorPermissionService extends SearchQuery {

    constructor(private http: HttpClient) {
        super();
    }

    search(params: IndicatorPermissionSearchOptions): Observable<IndicatorPermissionSearchResponse> {
        const queryParams: HttpParams = this.buildQueryParams(params);
        return this.http.get(`${environment.baseApiUrl}indicatorpermissions`, { params: queryParams, observe: 'response' })
            .pipe(
                map(response => {
                    const headers = JSON.parse(response.headers.get("x-pagination")) as PagingHeaders;
                    const indicatorPermissions = response.body as IndicatorPermission[];
                    return { indicatorPermissions: indicatorPermissions, headers: headers };
                })
            );
    }

    get(indicatorPermissionId: string): Observable<IndicatorPermission> {
        return this.http.get<IndicatorPermission>(`${environment.baseApiUrl}indicatorpermissions/${indicatorPermissionId}`);
    }

    save(indicatorPermission: IndicatorPermission): Observable<IndicatorPermission> {
        return this.http.post<IndicatorPermission>(`${environment.baseApiUrl}indicatorpermissions/${indicatorPermission.indicatorPermissionId}`, indicatorPermission);
    }

    saveMany(indicatorPermissions: IndicatorPermission[]): Observable<void> {
        return this.http.post<void>(`${environment.baseApiUrl}indicatorpermissions/savemany`, indicatorPermissions);
    }

    delete(indicatorPermissionId: string): Observable<void> {
        return this.http.delete<void>(`${environment.baseApiUrl}indicatorpermissions/${indicatorPermissionId}`);
    }

    byUser(userId: string, includeEntities: boolean = false, includeOtherAssignors: boolean = false): Observable<IndicatorPermission[]> {
        const queryParams: HttpParams = this.buildQueryParams({ includeEntities: includeEntities, includeOtherAssignors: includeOtherAssignors });
        return this.http.get<IndicatorPermission[]>(`${environment.baseApiUrl}indicatorpermissions/byuser/${userId}`, { params: queryParams });
    }

    deleteByUser(userId: string, permissionIds: string[]): Observable<void> {
        // using post to send Ids in body
        return this.http.post<void>(`${environment.baseApiUrl}indicatorpermissions/deletebyuser/${userId}`, permissionIds);
    }

    assignPermissions(assignIndicatorPermissions: AssignPermissionModel[]): Observable<void> {
        return this.http.post<void>(`${environment.baseApiUrl}indicatorpermissions/assign`, assignIndicatorPermissions);
    }

}
