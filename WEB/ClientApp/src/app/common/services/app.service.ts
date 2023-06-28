import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, } from '@angular/common/http';
import { Observable, of, share, tap } from 'rxjs';
import { AppSettings } from '../models/appsettings.model';

@Injectable({ providedIn: 'root' })
export class AppService {

    private _appSettings: AppSettings;
    private _getAppSettings: Observable<AppSettings>;

    constructor(
        private http: HttpClient
    ) {
    }

    setupCheck(): Observable<{ setupCompleted: boolean }> {
        return this.http
            .get<{ setupCompleted: boolean }>(`${environment.baseApiUrl}app/setupcheck`)
    }

    getAppSettings(): Observable<AppSettings> {
        // if the settings have already been retrieved, return them
        if (this._appSettings) {
            return of(this._appSettings);
        }
        // if a request is currently outstanding, return that request
        if (!this._getAppSettings) {
            this._getAppSettings = this.http
                .get<AppSettings>(`${environment.baseApiUrl}app/settings`)
                .pipe(share())
                .pipe(tap(appSettings => {
                    this._appSettings = appSettings;
                    // clear the outstanding request
                    this._getAppSettings = undefined;
                }));
        }
        return this._getAppSettings;
    }

}
