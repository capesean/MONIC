import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Settings, SettingsSearchOptions, SettingsSearchResponse } from '../models/settings.model';
import { SearchQuery, PagingHeaders } from '../models/http.model';

@Injectable({ providedIn: 'root' })
export class SettingsService extends SearchQuery {

    constructor(private http: HttpClient) {
        super();
    }

    search(params: SettingsSearchOptions): Observable<SettingsSearchResponse> {
        const queryParams: HttpParams = this.buildQueryParams(params);
        return this.http.get(`${environment.baseApiUrl}settings`, { params: queryParams, observe: 'response' })
            .pipe(
                map(response => {
                    const headers = JSON.parse(response.headers.get("x-pagination")) as PagingHeaders;
                    const settings = response.body as Settings[];
                    return { settings: settings, headers: headers };
                })
            );
    }

    get(id: string): Observable<Settings> {
        return this.http.get<Settings>(`${environment.baseApiUrl}settings/${id}`);
    }

    save(settings: Settings): Observable<Settings> {
        return this.http.post<Settings>(`${environment.baseApiUrl}settings/${settings.id}`, settings);
    }

    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${environment.baseApiUrl}settings/${id}`);
    }

}
