import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Document, DocumentSearchOptions, DocumentSearchResponse } from '../models/document.model';
import { SearchQuery, PagingHeaders } from '../models/http.model';

@Injectable({ providedIn: 'root' })
export class DocumentService extends SearchQuery {

    constructor(private http: HttpClient) {
        super();
    }

    search(params: DocumentSearchOptions): Observable<DocumentSearchResponse> {
        const queryParams: HttpParams = this.buildQueryParams(params);
        return this.http.get(`${environment.baseApiUrl}documents`, { params: queryParams, observe: 'response' })
            .pipe(
                map(response => {
                    const headers = JSON.parse(response.headers.get("x-pagination")) as PagingHeaders;
                    const documents = response.body as Document[];
                    return { documents: documents, headers: headers };
                })
            );
    }

    get(documentId: string): Observable<Document> {
        return this.http.get<Document>(`${environment.baseApiUrl}documents/${documentId}`);
    }

    save(document: Document): Observable<Document> {
        return this.http.post<Document>(`${environment.baseApiUrl}documents/${document.documentId}`, document);
    }

    delete(documentId: string): Observable<void> {
        return this.http.delete<void>(`${environment.baseApiUrl}documents/${documentId}`);
    }

}
