import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserTest, UserTestSearchOptions, UserTestSearchResponse } from '../models/usertest.model';
import { SearchQuery, SearchOptions, PagingHeaders } from '../models/http.model';

@Injectable({ providedIn: 'root' })
export class UserTestService extends SearchQuery {

    constructor(private http: HttpClient) {
        super();
    }

    search(params: UserTestSearchOptions): Observable<UserTestSearchResponse> {
        const queryParams: HttpParams = this.buildQueryParams(params);
        return this.http.get(`${environment.baseApiUrl}usertests`, { params: queryParams, observe: 'response' })
            .pipe(
                map(response => {
                    const headers = JSON.parse(response.headers.get("x-pagination")) as PagingHeaders;
                    const userTests = response.body as UserTest[];
                    return { userTests: userTests, headers: headers };
                })
            );
    }

    get(userTestId: string): Observable<UserTest> {
        return this.http.get<UserTest>(`${environment.baseApiUrl}usertests/${userTestId}`);
    }

    save(userTest: UserTest): Observable<UserTest> {
        return this.http.post<UserTest>(`${environment.baseApiUrl}usertests/${userTest.userTestId}`, userTest);
    }

    delete(userTestId: string): Observable<void> {
        return this.http.delete<void>(`${environment.baseApiUrl}usertests/${userTestId}`);
    }

    sort(userId: string, ids: string[]): Observable<void> {
        return this.http.post<void>(`${environment.baseApiUrl}usertests/sort?userid=${userId}`, ids);
    }

}
