import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { BehaviorSubject, interval, Observable, of, Subscription, throwError } from "rxjs";
import { catchError, filter, first, map, mergeMap, share, tap } from "rxjs/operators";
import { environment } from "../../../environments/environment";
import { AuthStateModel, AuthTokenModel, ChangePasswordModel, JwtTokenModel, LoginModel, PasswordRequirements, RefreshGrantModel, RegisterModel, ResetModel, ResetPasswordModel } from "../models/auth.models";
import { ProfileModel } from "../models/profile.models";
import { Enums, Roles } from "../models/enums.model";

@Injectable({ providedIn: 'root' })
export class AuthService {

    private initalState: AuthStateModel = { jwtToken: null, tokens: null, authReady: false };
    private state: BehaviorSubject<AuthStateModel>;
    private refreshSubscription$: Subscription;
    public state$: Observable<AuthStateModel>;
    public tokens$: Observable<AuthTokenModel>;
    public loggedIn$: Observable<boolean>;
    private _profile: ProfileModel;
    private profileGet: Observable<ProfileModel>;
    private roles: string | string[];

    constructor(
        private http: HttpClient,
        private router: Router
    ) {
        this.state = new BehaviorSubject<AuthStateModel>(this.initalState);
        this.state$ = this.state.asObservable();

        this.tokens$ = this.state
            .pipe(filter(state => state.authReady))
            .pipe(map(state => state.tokens));

        this.loggedIn$ = this.tokens$
            .pipe(map(tokens => !!tokens));
    }

    init(): Observable<AuthTokenModel> {
        return this.startupTokenRefresh()
            .pipe(tap<AuthTokenModel>(() => this.scheduleRefresh()));
    }

    register(data: RegisterModel): Observable<Response> {
        return this.http.post<Response>(`${environment.baseApiUrl}authorization/register`, data);
    }

    resetPassword(data: ResetPasswordModel): Observable<void> {
        return this.http.post<void>(`${environment.baseApiUrl}authorization/resetpassword`, data);
    }

    reset(data: ResetModel): Observable<void> {
        return this.http.post<void>(`${environment.baseApiUrl}authorization/reset`, data);
    }

    login(user: LoginModel): Observable<void | AuthTokenModel> {
        return this.getTokens(user, 'password')
            .pipe(tap(() => this.scheduleRefresh()));
    }

    logout(): void {
        this.updateState({ jwtToken: null, tokens: null });
        if (this.refreshSubscription$) {
            this.refreshSubscription$.unsubscribe();
        }
        this.removeToken();
        this.clearProfile();
    }

    clearProfile(): void {
        this._profile = undefined;
    }

    getPasswordRequirements(): Observable<PasswordRequirements> {
        return this.http.get<PasswordRequirements>(`${environment.baseApiUrl}authorization/passwordrequirements`);
    }

    changePassword(changePassword: ChangePasswordModel): Observable<void> {
        return this.http.post<void>(`${environment.baseApiUrl}authorization/changepassword`, changePassword);
    }

    isInRole(role: string | Roles): boolean {
        if (!this.roles || !this.roles.length) return false;

        // if user is admin, they have all/any roles
        if (typeof (this.roles) === "string" && this.roles === "Administrator") return true;
        if (typeof (this.roles) !== "string" && this.roles.indexOf("Administrator") > -1) return true;

        if (typeof (role) === "number") role = Enums.Roles[role].name;
        if (typeof (this.roles) === "string") return role === this.roles;
        return this.roles.indexOf(role) > -1;
    }

    refreshTokens(): Observable<AuthTokenModel> {
        return this.state
            .pipe(first())
            /*
             * OpenIddict 3 invalidates refresh tokens after being used, so the latest token might have been retrieved by another tab
             * and stored in localStorage, so get it from there rather than from the state. Two calls at the same time will invalidate one,
             * though - needs to be handled.
            */
            //.pipe(map(state => state.tokens))
            .pipe(map(() => this.retrieveTokens()))
            .pipe(
                mergeMap(tokens => {

                    // if there is no token in local storage, redirect to login
                    if (!tokens) {
                        return of(undefined);
                    }

                    // token has been retrieved from local storage, refresh from the endpoint
                    return this.getTokens({ refresh_token: tokens.refresh_token }, 'refresh_token')
                        .pipe(catchError(err => {
                            // error attempting to refresh tokens: redirect to login
                            if (err.status === 0) {
                                return null;
                                // do nothing: might not have an internet connection
                            } else if (window.location.pathname !== "/auth/login")
                                this.router.navigate(["/auth/login"]);

                            return throwError(() => 'Session Expired');

                        }));
                }
                ));
    }

    private storeToken(tokens: AuthTokenModel): void {
        const previousTokens = this.retrieveTokens();
        if (previousTokens && !tokens.refresh_token) {
            tokens.refresh_token = previousTokens.refresh_token;
        }

        localStorage.setItem('auth-tokens', JSON.stringify(tokens));
    }

    private retrieveTokens(): AuthTokenModel {
        const tokensString = localStorage.getItem('auth-tokens');
        const tokensModel: AuthTokenModel = !tokensString ? null : JSON.parse(tokensString);
        return tokensModel;
    }

    private removeToken(): void {
        localStorage.removeItem('auth-tokens');
    }

    private updateState(newState: AuthStateModel): void {
        const previousState = this.state.getValue();
        this.state.next(Object.assign({}, previousState, newState));
    }

    private getTokens(data: RefreshGrantModel | LoginModel, grantType: string): Observable<AuthTokenModel> {
        const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
        const options = { headers: headers };

        Object.assign(data, { grant_type: grantType, scope: 'openid offline_access profile roles' });

        const params = new URLSearchParams();
        Object.keys(data)
            .forEach(key => params.append(key, (<any>data)[key]));

        return this.http.post<AuthTokenModel>(`${environment.baseAuthUrl}connect/token`, params.toString(), options)
            .pipe(tap<AuthTokenModel>(tokens => {
                const now = new Date();
                tokens.expiration_date = new Date(now.getTime() + tokens.expires_in * 1000).getTime().toString();

                const jwtToken: JwtTokenModel = this.decodeToken(tokens.id_token);
                this.roles = jwtToken.role;
                this.storeToken(tokens);
                this.updateState({ authReady: true, tokens, jwtToken });
            }));
    }

    private startupTokenRefresh(): Observable<AuthTokenModel> {
        return of(this.retrieveTokens())
            .pipe(mergeMap((tokens: AuthTokenModel) => {
                if (!tokens) {
                    this.updateState({ authReady: true });
                    return of(undefined);
                }
                const jwtToken: JwtTokenModel = this.decodeToken(tokens.id_token);
                this.updateState({ tokens, jwtToken });

                if (+tokens.expiration_date > new Date().getTime()) {
                    this.updateState({ authReady: true });
                }

                return this.refreshTokens();
            }))
            .pipe(catchError(error => {
                this.logout();
                this.updateState({ authReady: true });
                return throwError(() => error);
            }));
    }

    private scheduleRefresh(): void {
        this.refreshSubscription$ = this.tokens$
            .pipe(first())
            // refresh every half the total expiration time
            .pipe(mergeMap(tokens => {
                if (!tokens) return of(undefined);

                return interval(tokens.expires_in / 2 * 1000);
            }))
            .pipe(mergeMap(() => this.refreshTokens()))
            .subscribe();
    }

    getProfile(refresh?: boolean): Observable<ProfileModel> {
        // if the profile has already been retrieved, return it
        if (!refresh && this._profile) {
            return of(this._profile);
        }
        // if a request is currently outstanding, return that request
        if (!this.profileGet) {
            this.profileGet = this.http
                .get<ProfileModel>(`${environment.baseApiUrl}profile`)
                .pipe(share())
                .pipe(tap(profile => {
                    this._profile = profile;
                    // clear the outstanding request
                    this.profileGet = undefined;
                }));
        }
        return this.profileGet;
    }

    private decodeToken(token: string): JwtTokenModel {
        if (!token || token === "") {
            return null;
        }
        const parts = token.split(".");
        if (parts.length !== 3) {
            throw new Error("The inspected token doesn't appear to be a JWT. Check to make sure it has three parts and see https://jwt.io for more.");
        }
        const decoded = this.urlBase64Decode(parts[1]);
        if (!decoded) {
            throw new Error("Cannot decode the token.");
        }

        return JSON.parse(decoded);
    }

    private urlBase64Decode(str: string): string {
        let output = str.replace(/-/g, "+").replace(/_/g, "/");
        switch (output.length % 4) {
            case 0: {
                break;
            }
            case 2: {
                output += "==";
                break;
            }
            case 3: {
                output += "=";
                break;
            }
            default: {
                throw new Error("Illegal base64url string!");
            }
        }
        return this.b64DecodeUnicode(output);
    }

    private b64DecodeUnicode(str: string): string {
        return decodeURIComponent(Array.prototype.map
            .call(this.b64decode(str), (c) => {
                return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
            })
            .join(""));
    }

    private b64decode(str: string): string {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        let output = "";
        str = String(str).replace(/=+$/, "");
        if (str.length % 4 === 1) {
            throw new Error("'atob' failed: The string to be decoded is not correctly encoded.");
        }
        for (
            // initialize result and counters
            let bc = 0, bs: number, buffer, idx = 0;
            // get next character
            (buffer = str.charAt(idx++));
            // character found in table? initialize bit storage and add its ascii value;
            ~buffer &&
                ((bs = bc % 4 ? bs * 64 + buffer : buffer),
                    // and if not first of each 4 characters,
                    // convert the first 8 bits to one ascii character
                    bc++ % 4)
                ? (output += String.fromCharCode(255 & (bs >> ((-2 * bc) & 6))))
                : 0) {
            // try to find character in table (0-63, not found => -1)
            buffer = chars.indexOf(buffer);
        }
        return output;
    }

}
