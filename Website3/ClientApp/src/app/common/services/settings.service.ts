import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Settings } from '../models/settings.model';

@Injectable({ providedIn: 'root' })
export class SettingsService {

    constructor(private http: HttpClient) {
    }

    get(): Observable<Settings> {
        return this.http.get<Settings>(`${environment.baseApiUrl}settings`);
    }

    save(settings: Settings): Observable<Settings> {
        return this.http.post<Settings>(`${environment.baseApiUrl}settings`, settings);
    }

}
