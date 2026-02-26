import { Injectable } from "@angular/core";
import { AppSettings } from "../models/appsettings.model";
import { Observable, catchError, of, shareReplay, tap, throwError } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { ErrorService } from "./error.service";
import { environment } from "../../../environments/environment";

@Injectable({ providedIn: 'root' })
export class AppSettingsService {
    private _settings: AppSettings | null = null;
    private inFlight?: Observable<AppSettings>;

    constructor(private http: HttpClient, private errorService: ErrorService) { }

    get settings(): AppSettings {
        if (!this._settings) throw new Error('AppSettings not loaded yet');
        return this._settings;
    }

    init(force = false): Observable<AppSettings> {
        if (this._settings && !force) return of(this._settings);
        if (this.inFlight && !force) return this.inFlight;

        this.inFlight = this.http.get<AppSettings>(`${environment.baseApiUrl}app/settings`).pipe(
            tap(s => { this._settings = s; }),
            catchError(err => {
                this.errorService.handleError(err, 'Settings', 'Load');
                return throwError(() => err);
            }),
            tap({
                next: () => this.inFlight = undefined,
                error: () => this.inFlight = undefined
            }),
            shareReplay(1)
        );

        return this.inFlight;
    }

    clear() {
        this._settings = null;
        this.inFlight = undefined;
    }
}
