import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Section, SectionSearchOptions, SectionSearchResponse } from '../models/section.model';
import { SearchQuery, PagingHeaders } from '../models/http.model';

@Injectable({ providedIn: 'root' })
export class SectionService extends SearchQuery {

    constructor(private http: HttpClient) {
        super();
    }

    search(params: SectionSearchOptions): Observable<SectionSearchResponse> {
        const queryParams: HttpParams = this.buildQueryParams(params);
        return this.http.get(`${environment.baseApiUrl}sections`, { params: queryParams, observe: 'response' })
            .pipe(
                map(response => {
                    const headers = JSON.parse(response.headers.get("x-pagination")) as PagingHeaders;
                    const sections = response.body as Section[];
                    return { sections: sections, headers: headers };
                })
            );
    }

    get(sectionId: string): Observable<Section> {
        return this.http.get<Section>(`${environment.baseApiUrl}sections/${sectionId}`);
    }

    save(section: Section): Observable<Section> {
        return this.http.post<Section>(`${environment.baseApiUrl}sections/${section.sectionId}`, section);
    }

    delete(sectionId: string): Observable<void> {
        return this.http.delete<void>(`${environment.baseApiUrl}sections/${sectionId}`);
    }

    sort(questionnaireId: string, ids: string[]): Observable<void> {
        return this.http.post<void>(`${environment.baseApiUrl}sections/sort?questionnaireid=${questionnaireId}`, ids);
    }

    deleteQuestions(sectionId: string): Observable<void> {
        return this.http.delete<void>(`${environment.baseApiUrl}sections/${sectionId}/questions`);
    }

}
