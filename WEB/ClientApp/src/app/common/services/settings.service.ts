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

    get(): Observable<Settings> {
        return this.http.get<Settings>(`${environment.baseApiUrl}settings`);
    }

    save(settings: Settings): Observable<Settings> {
        return this.http.post<Settings>(`${environment.baseApiUrl}settings`, settings);
    }

}
