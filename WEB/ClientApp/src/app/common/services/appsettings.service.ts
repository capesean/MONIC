import { Injectable } from "@angular/core";
import { AppSettings } from "../models/appsettings.model";
import { Observable, catchError, of, shareReplay, tap, throwError } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { ErrorService } from "./error.service";
import { environment } from "../../../environments/environment";

@Injectable({ providedIn: 'root' })
export class AppSettingsService {
    private _appSettings: AppSettings | null = null;
    private inFlight?: Observable<AppSettings>;

    constructor(private http: HttpClient, private errorService: ErrorService) { }

    get appSettings(): AppSettings {
        if (!this._appSettings) throw new Error('AppSettings not loaded yet');
        return this._appSettings;
    }

    init(force = false): Observable<AppSettings> {
        if (this._appSettings && !force) return of(this._appSettings);
        if (this.inFlight && !force) return this.inFlight;

        this.inFlight = this.http.get<AppSettings>(`${environment.baseApiUrl}app/settings`).pipe(
            tap(s => { this._appSettings = s; }),
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
        this._appSettings = null;
        this.inFlight = undefined;
    }
}
