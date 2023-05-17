import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FolderContent, FolderContentSearchOptions, FolderContentSearchResponse } from '../models/foldercontent.model';
import { SearchQuery, PagingHeaders } from '../models/http.model';

@Injectable({ providedIn: 'root' })
export class FolderContentService extends SearchQuery {

    constructor(private http: HttpClient) {
        super();
    }

    search(params: FolderContentSearchOptions): Observable<FolderContentSearchResponse> {
        const queryParams: HttpParams = this.buildQueryParams(params);
        return this.http.get(`${environment.baseApiUrl}foldercontents`, { params: queryParams, observe: 'response' })
            .pipe(
                map(response => {
                    const headers = JSON.parse(response.headers.get("x-pagination")) as PagingHeaders;
                    const folderContents = response.body as FolderContent[];
                    return { folderContents: folderContents, headers: headers };
                })
            );
    }

    get(folderContentId: string): Observable<FolderContent> {
        return this.http.get<FolderContent>(`${environment.baseApiUrl}foldercontents/${folderContentId}`);
    }

    save(folderContent: FolderContent): Observable<FolderContent> {
        return this.http.post<FolderContent>(`${environment.baseApiUrl}foldercontents/${folderContent.folderContentId}`, folderContent);
    }

    delete(folderContentId: string): Observable<void> {
        return this.http.delete<void>(`${environment.baseApiUrl}foldercontents/${folderContentId}`);
    }

}
