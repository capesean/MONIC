import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TheoryOfChange, TheoryOfChangeSearchOptions, TheoryOfChangeSearchResponse } from '../models/theoryofchange.model';
import { SearchQuery, PagingHeaders } from '../models/http.model';

@Injectable({ providedIn: 'root' })
export class TheoryOfChangeService extends SearchQuery {

    constructor(private http: HttpClient) {
        super();
    }

    search(params: TheoryOfChangeSearchOptions): Observable<TheoryOfChangeSearchResponse> {
        const queryParams: HttpParams = this.buildQueryParams(params);
        return this.http.get(`${environment.baseApiUrl}theoriesofchange`, { params: queryParams, observe: 'response' })
            .pipe(
                map(response => {
                    const headers = JSON.parse(response.headers.get("x-pagination")) as PagingHeaders;
                    const theoriesOfChange = response.body as TheoryOfChange[];
                    return { theoriesOfChange: theoriesOfChange, headers: headers };
                })
            );
    }

    get(theoryOfChangeId: string, includeChildren: boolean = false): Observable<TheoryOfChange> {
        return this.http.get<TheoryOfChange>(`${environment.baseApiUrl}theoriesofchange/${theoryOfChangeId}${(includeChildren ? "?includeChildren=true" : "")}`);
    }

    save(theoryOfChange: TheoryOfChange): Observable<TheoryOfChange> {
        return this.http.post<TheoryOfChange>(`${environment.baseApiUrl}theoriesofchange/${theoryOfChange.theoryOfChangeId}`, theoryOfChange);
    }

    delete(theoryOfChangeId: string): Observable<void> {
        return this.http.delete<void>(`${environment.baseApiUrl}theoriesofchange/${theoryOfChangeId}`);
    }

    saveTheoryOfChangeComponents(theoryOfChangeId: string, componentIds: string[]): Observable<void> {
        return this.http.post<void>(`${environment.baseApiUrl}theoriesofchange/${theoryOfChangeId}/theoryofchangecomponents`, componentIds);
    }

    deleteTheoryOfChangeComponents(theoryOfChangeId: string): Observable<void> {
        return this.http.delete<void>(`${environment.baseApiUrl}theoriesofchange/${theoryOfChangeId}/theoryofchangecomponents`);
    }

    deleteRelationships(theoryOfChangeId: string): Observable<void> {
        return this.http.delete<void>(`${environment.baseApiUrl}theoriesofchange/${theoryOfChangeId}/relationships`);
    }

}
