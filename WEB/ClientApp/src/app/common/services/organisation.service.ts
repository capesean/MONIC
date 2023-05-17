import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Organisation, OrganisationSearchOptions, OrganisationSearchResponse } from '../models/organisation.model';
import { SearchQuery, PagingHeaders } from '../models/http.model';

@Injectable({ providedIn: 'root' })
export class OrganisationService extends SearchQuery {

    constructor(private http: HttpClient) {
        super();
    }

    search(params: OrganisationSearchOptions): Observable<OrganisationSearchResponse> {
        const queryParams: HttpParams = this.buildQueryParams(params);
        return this.http.get(`${environment.baseApiUrl}organisations`, { params: queryParams, observe: 'response' })
            .pipe(
                map(response => {
                    const headers = JSON.parse(response.headers.get("x-pagination")) as PagingHeaders;
                    const organisations = response.body as Organisation[];
                    return { organisations: organisations, headers: headers };
                })
            );
    }

    get(organisationId: string): Observable<Organisation> {
        return this.http.get<Organisation>(`${environment.baseApiUrl}organisations/${organisationId}`);
    }

    save(organisation: Organisation): Observable<Organisation> {
        return this.http.post<Organisation>(`${environment.baseApiUrl}organisations/${organisation.organisationId}`, organisation);
    }

    delete(organisationId: string): Observable<void> {
        return this.http.delete<void>(`${environment.baseApiUrl}organisations/${organisationId}`);
    }

    deleteEntities(organisationId: string): Observable<void> {
        return this.http.delete<void>(`${environment.baseApiUrl}organisations/${organisationId}/entities`);
    }

    deleteUsers(organisationId: string): Observable<void> {
        return this.http.delete<void>(`${environment.baseApiUrl}organisations/${organisationId}/users`);
    }

}
