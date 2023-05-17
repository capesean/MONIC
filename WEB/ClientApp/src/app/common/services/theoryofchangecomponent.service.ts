import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TheoryOfChangeComponent, TheoryOfChangeComponentSearchOptions, TheoryOfChangeComponentSearchResponse } from '../models/theoryofchangecomponent.model';
import { SearchQuery, PagingHeaders } from '../models/http.model';

@Injectable({ providedIn: 'root' })
export class TheoryOfChangeComponentService extends SearchQuery {

    constructor(private http: HttpClient) {
        super();
    }

    search(params: TheoryOfChangeComponentSearchOptions): Observable<TheoryOfChangeComponentSearchResponse> {
        const queryParams: HttpParams = this.buildQueryParams(params);
        return this.http.get(`${environment.baseApiUrl}theoryofchangecomponents`, { params: queryParams, observe: 'response' })
            .pipe(
                map(response => {
                    const headers = JSON.parse(response.headers.get("x-pagination")) as PagingHeaders;
                    const theoryOfChangeComponents = response.body as TheoryOfChangeComponent[];
                    return { theoryOfChangeComponents: theoryOfChangeComponents, headers: headers };
                })
            );
    }

    get(theoryOfChangeId: string, componentId: string): Observable<TheoryOfChangeComponent> {
        return this.http.get<TheoryOfChangeComponent>(`${environment.baseApiUrl}theoryofchangecomponents/${theoryOfChangeId}/${componentId}`);
    }

    save(theoryOfChangeComponent: TheoryOfChangeComponent): Observable<TheoryOfChangeComponent> {
        return this.http.post<TheoryOfChangeComponent>(`${environment.baseApiUrl}theoryofchangecomponents/${theoryOfChangeComponent.theoryOfChangeId}/${theoryOfChangeComponent.componentId}`, theoryOfChangeComponent);
    }

    delete(theoryOfChangeId: string, componentId: string): Observable<void> {
        return this.http.delete<void>(`${environment.baseApiUrl}theoryofchangecomponents/${theoryOfChangeId}/${componentId}`);
    }

}
