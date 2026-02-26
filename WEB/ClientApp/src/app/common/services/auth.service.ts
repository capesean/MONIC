import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { BehaviorSubject, interval, Observable, of, Subscription, throwError, forkJoin } from "rxjs";
import { catchError, first, map, mergeMap, shareReplay, switchMap, tap } from "rxjs/operators";
import { environment } from "../../../environments/environment";
import { AuthStateModel, AuthTokenModel, ChangePasswordModel, JwtTokenModel, LoginModel, PasswordRequirements, RefreshGrantModel, RegisterModel, ResetModel, ResetPasswordModel } from "../models/auth.models";
import { ProfileModel } from "../models/profile.models";
import { Enums, Roles } from "../models/enums.model";
import { AppSettingsService } from "./appsettings.service";
import { FolderShortcutSettings, IndicatorBarChartSettings, IndicatorLineChartSettings, IndicatorMapSettings, IndicatorPieChartSettings, WidgetSettings } from "../models/widget.model";

@Injectable({ providedIn: "root" })
export class AuthService {

    private initalState: AuthStateModel = { jwtToken: null, tokens: null, authReady: false };
    private _state$: BehaviorSubject<AuthStateModel>;
    public state$: Observable<AuthStateModel>;
    public tokens$: Observable<AuthTokenModel>;
    public loggedIn$: Observable<boolean>;
    private refreshScheduled = false;

    private refreshSubscription$?: Subscription;

    // profile cache + in-flight
    private profileGet$?: Observable<ProfileModel>;
    private _profile?: ProfileModel;
    private _roles: string[] = [];

    private settingsLoaded = false;

    // one-time init pipeline so guards/components can safely wait
    private initOnce$?: Observable<void>;
    private initCompleted$ = new BehaviorSubject<boolean>(false);

    constructor(
        private http: HttpClient,
        private router: Router,
        private appSettingsService: AppSettingsService
    ) {
        this._state$ = new BehaviorSubject<AuthStateModel>(this.initalState);
        this.state$ = this._state$.asObservable();

        this.tokens$ = this._state$.pipe(map(s => s.tokens));
        this.loggedIn$ = this._state$.pipe(map(s => !!s.tokens));

    }

    initialize(): Observable<void> {

        if (this.initOnce$) return this.initOnce$;

        this.initOnce$ = this.startupTokenRefresh().pipe(
            switchMap(tokens => {
                if (!tokens) return of(undefined as void);

                return forkJoin([
                    this.ensureSettingsLoadedOnce(),
                    this.ensureProfileLoadedOnce(false)
                ]).pipe(map(() => undefined as void));
            }),
            tap(() => {
                this.scheduleRefresh();
                this.initCompleted$.next(true);
            }),
            catchError(err => {
                this.logout();
                this.updateState({ authReady: true });
                this.initCompleted$.next(true);
                return of(undefined as void);
            }),
            shareReplay(1)
        );


        return this.initOnce$;
    }

    /** sync-ish getters AFTER initialize() completed */
    get isInitialized(): boolean {
        return this.initCompleted$.getValue();
    }

    get isLoggedInSync(): boolean {
        return !!this._state$.getValue().tokens;
    }

    get profileSync(): ProfileModel | undefined {
        return this._profile;
    }

    /** Auth flows */
    login(user: LoginModel): Observable<AuthTokenModel | void> {
        return this.getTokens(user, "password").pipe(
            switchMap(tokens => {
                if (!tokens) return of(undefined);

                // on login: load settings + profile before we consider the session ready for the app
                return forkJoin([
                    this.ensureSettingsLoadedOnce(),
                    this.ensureProfileLoadedOnce(true)
                ]).pipe(map(() => tokens));
            }),
            tap(() => {
                // login should reset initOnce so future initialize() doesn't reuse old result
                this.initOnce$ = undefined;
                this.initCompleted$.next(true);
                this.scheduleRefresh();
            })
        );
    }

    logout(): void {
        this.refreshScheduled = false;
        this.stopRefreshTimer();

        this.updateState({ jwtToken: null, tokens: null });
        this.removeToken();

        this.clearProfile();
        this._roles = [];

        this.settingsLoaded = false;
        this.appSettingsService.clear();

        // allow re-init if user comes back
        this.initOnce$ = undefined;
        this.initCompleted$.next(false);
    }

    /** Profile */
    clearProfile(): void {
        this._profile = undefined;
        this.profileGet$ = undefined;
    }

    get profile(): ProfileModel { return this._profile; }

    refreshProfile(): Observable<ProfileModel> {
        // if a request is currently outstanding, return that request
        if (!this.profileGet$) {
            this.profileGet$ = this.http
                .get<ProfileModel>(`${environment.baseApiUrl}profile`)
                .pipe(shareReplay())
                .pipe(tap(profile => {
                    this._profile = profile;
                    // clear the outstanding request
                    this.profileGet$ = undefined;
                }));
        }
        return this.profileGet$;
    }

    private ensureProfileLoadedOnce(forceRefresh: boolean): Observable<ProfileModel | null> {
        if (!this.isLoggedInSync) return of(null);
        return this.refreshProfile();
    }


    public get roles(): string[] {
        return this._roles;
    }

    public isInRole(rolesToCheck: string | string[] | Roles | Roles[]): boolean {
        if (!this._roles.length) return false;

        if (this._roles.includes("Administrator")) return true;

        const normalize = (r: string | Roles) =>
            typeof r === "number" ? Enums.Roles[r].name : r;

        if (Array.isArray(rolesToCheck)) {
            return rolesToCheck.some(r => this._roles.includes(normalize(r as any)));
        }

        return this._roles.includes(normalize(rolesToCheck as any));
    }

    /** Settings */
    private ensureSettingsLoadedOnce(): Observable<void> {
        if (this.settingsLoaded) return of(void 0);

        return this.appSettingsService.init().pipe(
            tap(() => (this.settingsLoaded = true)),
            map((): void => undefined)
        );
    }

    /** Token refresh */
    refreshTokens(): Observable<AuthTokenModel> {
        return this._state$.pipe(
            first(),
            map(() => this.retrieveTokens()),
            mergeMap(tokens => {
                if (!tokens) return of(undefined);

                return this.getTokens({ refresh_token: tokens.refresh_token }, "refresh_token").pipe(
                    // after refreshing tokens, refresh profile too (roles may have changed)
                    switchMap(newTokens => {
                        if (!newTokens) return of(undefined);
                        return this.ensureProfileLoadedOnce(true).pipe(map(() => newTokens));
                    }),
                    catchError(err => {
                        if (err.status === 0 || err.status >= 500) return of(tokens); // keep current tokens
                        if (window.location.pathname !== "/auth/login") this.router.navigate(["/auth/login"]);
                        return of(undefined);
                    })
                );
            })
        );
    }

    private startupTokenRefresh(): Observable<AuthTokenModel> {
        return of(this.retrieveTokens()).pipe(
            mergeMap(tokens => {
                if (!tokens) {
                    this.updateState({ authReady: true, jwtToken: null, tokens: null });
                    return of(undefined);
                }

                const jwtToken = this.decodeToken(tokens.id_token);
                this.updateState({ tokens, jwtToken });

                const notExpired = +tokens.expiration_date > Date.now();
                if (notExpired) {
                    this.updateState({ authReady: true, jwtToken });
                    return of(tokens);
                }

                return this.refreshTokens().pipe(
                    catchError(err => {
                        this.logout();
                        this.updateState({ authReady: true });
                        return throwError(() => err);
                    })
                );
            }),
            catchError(err => {
                this.logout();
                this.updateState({ authReady: true });
                return throwError(() => err);
            })
        );
    }

    private scheduleRefresh(): void {
        if (this.refreshScheduled) return;
        this.refreshScheduled = true;

        this.stopRefreshTimer();

        this.refreshSubscription$ = this.tokens$.pipe(first()).pipe(
            mergeMap(tokens => {
                if (!tokens) return of(undefined);

                const expMs = Number(tokens.expiration_date);
                const skewMs = 30_000; // refresh 30s early
                const dueMs = Math.max(expMs - Date.now() - skewMs, 0);

                // first refresh at "dueMs", then keep refreshing on a normal cadence
                return interval(dueMs).pipe(
                    first(),
                    switchMap(() => this.refreshTokens()),
                    switchMap(() => interval((tokens.expires_in / 2) * 1000).pipe(
                        mergeMap(() => this.refreshTokens())
                    ))
                );
            })
        ).subscribe();
    }

    private stopRefreshTimer() {
        this.refreshSubscription$?.unsubscribe();
        this.refreshSubscription$ = undefined;
    }

    /** Token endpoint */
    private getTokens(data: RefreshGrantModel | LoginModel, grantType: string): Observable<AuthTokenModel> {
        const headers = new HttpHeaders({ "Content-Type": "application/x-www-form-urlencoded" });
        const options = { headers };

        Object.assign(data, { grant_type: grantType, scope: "openid offline_access profile roles" });

        const params = new URLSearchParams();
        Object.keys(data).forEach(key => params.append(key, (data as any)[key]));

        return this.http.post<AuthTokenModel>(`${environment.baseAuthUrl}connect/token`, params.toString(), options).pipe(
            tap(tokens => {
                const now = new Date();
                tokens.expiration_date = new Date(now.getTime() + tokens.expires_in * 1000).getTime().toString();

                const jwtToken: JwtTokenModel = this.decodeToken(tokens.id_token);

                this.storeToken(tokens);
                this.updateState({ authReady: true, tokens, jwtToken });
            })
        );
    }

    private storeToken(tokens: AuthTokenModel): void {
        const previousTokens = this.retrieveTokens();
        if (previousTokens && !tokens.refresh_token) tokens.refresh_token = previousTokens.refresh_token;
        localStorage.setItem("auth-tokens", JSON.stringify(tokens));
    }

    private retrieveTokens(): AuthTokenModel {
        const tokensString = localStorage.getItem("auth-tokens");
        return !tokensString ? null : JSON.parse(tokensString);
    }

    private removeToken(): void {
        localStorage.removeItem("auth-tokens");
    }

    private updateState(newState: Partial<AuthStateModel>): void {
        const previousState = this._state$.getValue();
        const merged = Object.assign({}, previousState, newState);
        this._state$.next(merged);

        // Keep a fallback roles stream based on JWT claim.
        // Profile roles (when loaded) will overwrite roles$ via applyRolesFromProfile().
        if ("jwtToken" in newState) {
            const jt = merged.jwtToken;
            if (jt?.role) {
                this._roles = Array.isArray(jt.role) ? jt.role : [jt.role];
            } else {
                this._roles = [];
            }
        }
    }

    /** JWT decode helpers */
    private decodeToken(token: string): JwtTokenModel {
        if (!token) return null;

        const parts = token.split(".");
        if (parts.length !== 3) throw new Error("Token is not a JWT (expected 3 parts).");

        const decoded = this.urlBase64Decode(parts[1]);
        if (!decoded) throw new Error("Cannot decode the token payload.");

        return JSON.parse(decoded);
    }

    private urlBase64Decode(str: string): string {
        let output = str.replace(/-/g, "+").replace(/_/g, "/");
        switch (output.length % 4) {
            case 0: break;
            case 2: output += "=="; break;
            case 3: output += "="; break;
            default: throw new Error("Illegal base64url string!");
        }
        return this.b64DecodeUnicode(output);
    }

    private b64DecodeUnicode(str: string): string {
        return decodeURIComponent(
            Array.prototype.map
                .call(this.b64decode(str), (c: string) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                .join("")
        );
    }

    private b64decode(str: string): string {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        let output = "";
        str = String(str).replace(/=+$/, "");
        if (str.length % 4 === 1) throw new Error("'atob' failed: string not correctly encoded.");

        for (let bc = 0, bs: number, buffer, idx = 0; (buffer = str.charAt(idx++));) {
            buffer = chars.indexOf(buffer);
            if (~buffer) {
                bs = bc % 4 ? (bs as any) * 64 + buffer : buffer;
                if (bc++ % 4) output += String.fromCharCode(255 & (bs >> ((-2 * bc) & 6)));
            }
        }
        return output;
    }

    /** Existing endpoints */
    register(data: RegisterModel): Observable<Response> {
        return this.http.post<Response>(`${environment.baseApiUrl}authorization/register`, data);
    }

    resetPassword(data: ResetPasswordModel): Observable<void> {
        return this.http.post<void>(`${environment.baseApiUrl}authorization/resetpassword`, data);
    }

    reset(data: ResetModel): Observable<void> {
        return this.http.post<void>(`${environment.baseApiUrl}authorization/reset`, data);
    }

    getPasswordRequirements(): Observable<PasswordRequirements> {
        return this.http.get<PasswordRequirements>(`${environment.baseApiUrl}authorization/passwordrequirements`);
    }

    changePassword(changePassword: ChangePasswordModel): Observable<void> {
        return this.http.post<void>(`${environment.baseApiUrl}authorization/changepassword`, changePassword);
    }

    canEdit(indicatorId?: string): boolean {
        if (this.isInRole(Roles.Administrator)) return true;
        return !!this._profile.indicatorPermissions.find(o => o.edit && (indicatorId === undefined || o.indicatorId === indicatorId));
    }

    canSubmit(indicatorId?: string): boolean {
        if (!this.appSettingsService.appSettings.useSubmit) {
            return false;
        }
        if (this.isInRole(Roles.Administrator)) {
            return true;
        }
        return !!this._profile.indicatorPermissions.find(
            o => o.submit && (indicatorId === undefined || o.indicatorId === indicatorId)
        );
    }

    canVerify(indicatorId?: string): boolean {
        if (!this.appSettingsService.appSettings.useVerify) {
            return false;
        }
        if (this.isInRole(Roles.Administrator)) {
            return true;
        }
        return !!this._profile.indicatorPermissions.find(
            o => o.verify && (indicatorId === undefined || o.indicatorId === indicatorId)
        );
    }

    canApprove(indicatorId?: string): boolean {
        if (!this.appSettingsService.appSettings.useApprove) {
            return false;
        }
        if (this.isInRole(Roles.Administrator)) {
            return true;
        }
        if (!this._profile) debugger;
        return !!this._profile.indicatorPermissions.find(
            o => o.approve && (indicatorId === undefined || o.indicatorId === indicatorId)
        );
    }

    saveDashboardSettings(settings?: WidgetSettings | IndicatorMapSettings | IndicatorLineChartSettings | IndicatorBarChartSettings | IndicatorPieChartSettings | FolderShortcutSettings, remove?: boolean): Observable<void> {
        // updating just one widget
        if (settings) {
            const ix = this._profile.dashboardSettings.findIndex(o => o.id === settings.id);
            if (ix >= 0) {
                if (remove) {
                    this._profile.dashboardSettings.splice(ix, 1);
                } else {
                    this._profile.dashboardSettings[ix] = settings;
                }
            }
        }
        return this.http.post<void>(`${environment.baseApiUrl}profile/dashboardsettings`, { dashboardSettings: JSON.stringify(this._profile.dashboardSettings) });
    }

}
