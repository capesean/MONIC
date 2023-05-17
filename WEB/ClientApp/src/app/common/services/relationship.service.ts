import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Relationship, RelationshipSearchOptions, RelationshipSearchResponse } from '../models/relationship.model';
import { SearchQuery, PagingHeaders } from '../models/http.model';

@Injectable({ providedIn: 'root' })
export class RelationshipService extends SearchQuery {

    constructor(private http: HttpClient) {
        super();
    }

    search(params: RelationshipSearchOptions): Observable<RelationshipSearchResponse> {
        const queryParams: HttpParams = this.buildQueryParams(params);
        return this.http.get(`${environment.baseApiUrl}relationships`, { params: queryParams, observe: 'response' })
            .pipe(
                map(response => {
                    const headers = JSON.parse(response.headers.get("x-pagination")) as PagingHeaders;
                    const relationships = response.body as Relationship[];
                    return { relationships: relationships, headers: headers };
                })
            );
    }

    get(relationshipId: string): Observable<Relationship> {
        return this.http.get<Relationship>(`${environment.baseApiUrl}relationships/${relationshipId}`);
    }

    save(relationship: Relationship): Observable<Relationship> {
        return this.http.post<Relationship>(`${environment.baseApiUrl}relationships/${relationship.relationshipId}`, relationship);
    }

    delete(relationshipId: string): Observable<void> {
        return this.http.delete<void>(`${environment.baseApiUrl}relationships/${relationshipId}`);
    }

}
