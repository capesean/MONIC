import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap, first } from 'rxjs/operators';
import { AuthService } from '../../common/services/auth.service';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Injectable()
export class AuthoriseRequestInterceptor implements HttpInterceptor {

    constructor(private authService: AuthService) { }

    intercept(req: HttpRequest<unknown>,
        next: HttpHandler): Observable<HttpEvent<unknown>> {

        if (!req.url.startsWith(environment.baseApiUrl) || req.url.endsWith("connect/token"))
            return next.handle(req);

        return this.authService.tokens$
            .pipe(first())
            .pipe(
                switchMap(token => {
                    if (token) {
                        const cloned = req.clone({
                            headers: req.headers.set("Authorization", `Bearer ${token.access_token}`)
                        });
                        return next.handle(cloned);
                    } else {
                        return next.handle(req);
                    }

                })
            );
    }
}

@Injectable()
export class UnauthorisedResponseInterceptor implements HttpInterceptor {

    private refreshInFlight$?: Observable<any>;

    constructor(
        private authService: AuthService,
        private router: Router
    ) { }

    intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {

        return next.handle(request).pipe(
            catchError((err: HttpErrorResponse) => {

                // Only handle 401 for API calls (not token endpoint)
                if (
                    err.status !== 401 ||
                    !request.url.startsWith(environment.baseApiUrl) ||
                    request.url.endsWith('connect/token')
                ) {
                    if (err.status === 403) this.router.navigate(['/']);
                    return throwError(() => err);
                }

                // single-flight: if multiple requests 401 at once, only do one refresh
                if (!this.refreshInFlight$) {
                    this.refreshInFlight$ = this.authService.refreshTokens().pipe(first());
                }

                return this.refreshInFlight$.pipe(
                    switchMap(tokens => {
                        this.refreshInFlight$ = undefined;

                        if (!tokens) {
                            console.log('redirecting to login due to missing tokens after refresh'); 
                            this.router.navigate(['/auth/login']);
                            return throwError(() => err);
                        }

                        const retried = request.clone({
                            setHeaders: { Authorization: `Bearer ${tokens.access_token}` }
                        });

                        return next.handle(retried);
                    }),
                    catchError(refreshErr => {
                        this.refreshInFlight$ = undefined;

                        // If server is offline/restarting, don't force logout here
                        if (refreshErr?.status === 0 || refreshErr?.status >= 500) {
                            return throwError(() => err);
                        }
                        console.log('redirecting to login due to refresh failure', refreshErr);
                        this.router.navigate(['/auth/login']);
                        return throwError(() => err);
                    })
                );
            })
        );
    }
}
