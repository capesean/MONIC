import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Group, GroupSearchOptions, GroupSearchResponse } from '../models/group.model';
import { SearchQuery, PagingHeaders } from '../models/http.model';

@Injectable({ providedIn: 'root' })
export class GroupService extends SearchQuery {

    constructor(private http: HttpClient) {
        super();
    }

    search(params: GroupSearchOptions): Observable<GroupSearchResponse> {
        const queryParams: HttpParams = this.buildQueryParams(params);
        return this.http.get(`${environment.baseApiUrl}groups`, { params: queryParams, observe: 'response' })
            .pipe(
                map(response => {
                    const headers = JSON.parse(response.headers.get("x-pagination")) as PagingHeaders;
                    const groups = response.body as Group[];
                    return { groups: groups, headers: headers };
                })
            );
    }

    get(groupId: string): Observable<Group> {
        return this.http.get<Group>(`${environment.baseApiUrl}groups/${groupId}`);
    }

    save(group: Group): Observable<Group> {
        return this.http.post<Group>(`${environment.baseApiUrl}groups/${group.groupId}`, group);
    }

    delete(groupId: string): Observable<void> {
        return this.http.delete<void>(`${environment.baseApiUrl}groups/${groupId}`);
    }

    sort(ids: string[]): Observable<void> {
        return this.http.post<void>(`${environment.baseApiUrl}groups/sort`, ids);
    }

    deleteFields(groupId: string): Observable<void> {
        return this.http.delete<void>(`${environment.baseApiUrl}groups/${groupId}/fields`);
    }

}
