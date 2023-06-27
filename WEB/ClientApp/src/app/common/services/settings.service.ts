import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Settings } from '../models/settings.model';

@Injectable({ providedIn: 'root' })
export class SettingsService {

    private _settings: Settings;

    constructor(private http: HttpClient) {
    }

    get(): Observable<Settings> {
        if (this._settings) return of(this._settings);
        return this.http.get<Settings>(`${environment.baseApiUrl}settings`).pipe(tap(settings => this._settings = settings));
    }

    save(settings: Settings): Observable<Settings> {
        return this.http.post<Settings>(`${environment.baseApiUrl}settings`, settings);
    }

}
