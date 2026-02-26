import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AsyncSubject, catchError, Observable, of, share, tap } from 'rxjs';
import { ErrorService } from './error.service';
import { FieldData } from '../models/fielddata.model';
import { AppSettings } from '../models/appsettings.model';

@Injectable({ providedIn: 'root' })
export class AppService {

    constructor(
        private http: HttpClient
    ) {
    }

    setupCheck(): Observable<{ setupCompleted: boolean }> {
        return this.http
            .get<{ setupCompleted: boolean }>(`${environment.baseApiUrl}app/setupcheck`)
    }

    getAppSettings(refresh = false): Observable<AppSettings> {
        // if the settings have already been retrieved, return them
        if (this._appSettings && !refresh) {
            return of(this._appSettings);
        }
        // if a request is currently outstanding, return that request
        if (!this._getAppSettings) {
            this._getAppSettings = this.http
                .get<AppSettings>(`${environment.baseApiUrl}app/settings`)
                .pipe(catchError(err => {
                    this.errorService.handleError(err, "Settings", "Load");
                    throw 'error in source. Details:';
                }))
                .pipe(share())
                .pipe(tap(appSettings => {
                    this._appSettings = appSettings;
                    // clear the outstanding request
                    this._getAppSettings = undefined;
                }));
        }
        return this._getAppSettings;
    }

    private _fieldData$: AsyncSubject<FieldData>;
    public getFieldData(refresh = false): AsyncSubject<FieldData> {

        // todo: getProfile should be like this?
        if (!this._fieldData$ || refresh) {
            this._fieldData$ = new AsyncSubject<FieldData>();
            this.http
                .get<FieldData>(`${environment.baseApiUrl}app/fielddata`)
                .subscribe({
                    next: o => {
                        this._fieldData$.next(o);
                        this._fieldData$.complete();
                    },
                    error: err => {
                        this.errorService.handleError(err, "Field Data", "Load")
                    }
                });
        }
        return this._fieldData$;
    }

}
