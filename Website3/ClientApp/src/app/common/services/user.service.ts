import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User, UserSearchOptions, UserSearchResponse } from '../models/user.model';
import { SearchQuery, SearchOptions, PagingHeaders } from '../models/http.model';

@Injectable({ providedIn: 'root' })
export class UserService extends SearchQuery {

    constructor(private http: HttpClient) {
        super();
    }

    search(params: UserSearchOptions): Observable<UserSearchResponse> {
        const queryParams: HttpParams = this.buildQueryParams(params);
        return this.http.get(`${environment.baseApiUrl}users`, { params: queryParams, observe: 'response' })
            .pipe(
                map(response => {
                    const headers = JSON.parse(response.headers.get("x-pagination")) as PagingHeaders;
                    const users = response.body as User[];
                    return { users: users, headers: headers };
                })
            );
    }

    get(id: string): Observable<User> {
        return this.http.get<User>(`${environment.baseApiUrl}users/${id}`);
    }

    save(user: User): Observable<User> {
        return this.http.post<User>(`${environment.baseApiUrl}users/${user.id}`, user);
    }

    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${environment.baseApiUrl}users/${id}`);
    }

    deleteUserTests(id: string): Observable<void> {
        return this.http.delete<void>(`${environment.baseApiUrl}users/${id}/usertests`);
    }

}
