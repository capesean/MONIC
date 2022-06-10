import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { JwtHelperService } from "@auth0/angular-jwt";
import { BehaviorSubject, interval, Observable, of, Subscription, throwError } from "rxjs";
import { catchError, filter, first, flatMap, map, mergeMap, share, tap } from "rxjs/operators";
import { environment } from "../../../environments/environment";
import { AuthStateModel, AuthTokenModel, ChangePasswordModel, JwtTokenModel, LoginModel, RefreshGrantModel, RegisterModel, ResetModel, ResetPasswordModel } from "../models/auth.models";
import { ProfileModel } from "../models/profile.models";
import { Role } from "../models/roles.model";
import { ProfileService } from "./profile.service";

const jwt = new JwtHelperService();

@Injectable({ providedIn: 'root' })
export class AuthService {

    private initalState: AuthStateModel = { jwtToken: null, tokens: null, authReady: false };
    private state: BehaviorSubject<AuthStateModel>;
    private refreshSubscription$: Subscription;
    state$: Observable<AuthStateModel>;
    tokens$: Observable<AuthTokenModel>;
    jwtToken$: Observable<JwtTokenModel>;
    loggedIn$: Observable<boolean>;

    constructor(
        private http: HttpClient,
        private router: Router,
        private profileService: ProfileService
    ) {
        this.state = new BehaviorSubject<AuthStateModel>(this.initalState);
        this.state$ = this.state.asObservable();

        this.tokens$ = this.state
            .pipe(filter(state => state.authReady))
            .pipe(map(state => state.tokens));

        this.jwtToken$ = this.state
            .pipe(filter(state => state.authReady))
            .pipe(map(state => state.jwtToken));

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
            .pipe(catchError(res => throwError(res)))
            .pipe(tap(() => this.scheduleRefresh()));
    }

    logout(): void {
        this.updateState({ jwtToken: null, tokens: null });
        if (this.refreshSubscription$) {
            this.refreshSubscription$.unsubscribe();
        }
        this.removeToken();
        this.profileService.clearProfile();
    }

    changePassword(changePassword: ChangePasswordModel): Observable<void> {
        return this.http.post<void>(`${environment.baseApiUrl}authorization/changepassword`, changePassword);
    }

    isInRole(profile: ProfileModel, role: string | Role): boolean {
        if (!profile || !profile.roles) return false;
        if (typeof (role) === "object") role = role.name;
        if (typeof (profile.roles) === "string") return role === profile.roles;
        return profile.roles.indexOf(role) !== -1;
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
                        .pipe(catchError(() => {
                            // error attempting to refresh tokens: redirect to login
                            if (window.location.pathname !== "/auth/login") this.router.navigate(["/auth/login"]);

                            return throwError('Session Expired');
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

                const jwtToken: JwtTokenModel = jwt.decodeToken(tokens.id_token);

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
                const jwtToken: JwtTokenModel = jwt.decodeToken(tokens.id_token);
                this.updateState({ tokens, jwtToken });

                if (+tokens.expiration_date > new Date().getTime()) {
                    this.updateState({ authReady: true });
                }

                return this.refreshTokens();
            }))
            .pipe(catchError(error => {
                this.logout();
                this.updateState({ authReady: true });
                return throwError(error);
            }));
    }

    private scheduleRefresh(): void {
        this.refreshSubscription$ = this.tokens$
            .pipe(first())
            // refresh every half the total expiration time
            .pipe(flatMap(tokens => {
                if (!tokens) return of(undefined);

                return interval(tokens.expires_in / 2 * 1000);
            }))
            .pipe(flatMap(() => this.refreshTokens()))
            .subscribe();
    }
}
