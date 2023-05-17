import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Folder, FolderSearchOptions, FolderSearchResponse } from '../models/folder.model';
import { SearchQuery, PagingHeaders } from '../models/http.model';
import { Document } from '../models/document.model';
import { FolderContent } from '../models/foldercontent.model';

@Injectable({ providedIn: 'root' })
export class FolderService extends SearchQuery {

    constructor(private http: HttpClient) {
        super();
    }

    search(params: FolderSearchOptions): Observable<FolderSearchResponse> {
        const queryParams: HttpParams = this.buildQueryParams(params);
        return this.http.get(`${environment.baseApiUrl}folders`, { params: queryParams, observe: 'response' })
            .pipe(
                map(response => {
                    const headers = JSON.parse(response.headers.get("x-pagination")) as PagingHeaders;
                    const folders = response.body as Folder[];
                    return { folders: folders, headers: headers };
                })
            );
    }

    get(folderId: string): Observable<Folder> {
        return this.http.get<Folder>(`${environment.baseApiUrl}folders/${folderId}`);
    }

    save(folder: Folder): Observable<Folder> {
        return this.http.post<Folder>(`${environment.baseApiUrl}folders/${folder.folderId}`, folder);
    }

    delete(folderId: string): Observable<void> {
        return this.http.delete<void>(`${environment.baseApiUrl}folders/${folderId}`);
    }

    deleteSubfolders(folderId: string): Observable<void> {
        return this.http.delete<void>(`${environment.baseApiUrl}folders/${folderId}/subfolders`);
    }

    deleteFolderContents(folderId: string): Observable<void> {
        return this.http.delete<void>(`${environment.baseApiUrl}folders/${folderId}/foldercontents`);
    }

    view(folderId?: string): Observable<FolderView> {
        return this.http.get<FolderView>(`${environment.baseApiUrl}folder/view?folderId=${(folderId ?? "")}`);
    }

    getFolderContent(folderContentId: string): Observable<FolderContent> {
        return this.http.get<FolderContent>(`${environment.baseApiUrl}folder/foldercontent/${(folderContentId)}`);
    }

}

export class FolderView {
    public folder: Folder;
    public subfolders: Folder[];
    public documents: Document[];
    public folderContents: FolderContent[];
}
