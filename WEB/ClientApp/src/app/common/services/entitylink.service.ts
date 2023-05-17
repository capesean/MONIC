import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EntityLink, EntityLinkSearchOptions, EntityLinkSearchResponse } from '../models/entitylink.model';
import { SearchQuery, PagingHeaders } from '../models/http.model';

@Injectable({ providedIn: 'root' })
export class EntityLinkService extends SearchQuery {

    constructor(private http: HttpClient) {
        super();
    }

    search(params: EntityLinkSearchOptions): Observable<EntityLinkSearchResponse> {
        const queryParams: HttpParams = this.buildQueryParams(params);
        return this.http.get(`${environment.baseApiUrl}entitylinks`, { params: queryParams, observe: 'response' })
            .pipe(
                map(response => {
                    const headers = JSON.parse(response.headers.get("x-pagination")) as PagingHeaders;
                    const entityLinks = response.body as EntityLink[];
                    return { entityLinks: entityLinks, headers: headers };
                })
            );
    }

    get(childEntityId: string, parentEntityId: string): Observable<EntityLink> {
        return this.http.get<EntityLink>(`${environment.baseApiUrl}entitylinks/${childEntityId}/${parentEntityId}`);
    }

    save(entityLink: EntityLink): Observable<EntityLink> {
        return this.http.post<EntityLink>(`${environment.baseApiUrl}entitylinks/${entityLink.childEntityId}/${entityLink.parentEntityId}`, entityLink);
    }

    delete(childEntityId: string, parentEntityId: string): Observable<void> {
        return this.http.delete<void>(`${environment.baseApiUrl}entitylinks/${childEntityId}/${parentEntityId}`);
    }

}
