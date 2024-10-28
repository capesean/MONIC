import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
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

    constructor(
        private router: Router
    ) { }

    intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<any> {

        return next.handle(request)
            .pipe(
                catchError(
                    (err) => {
                        if (err.status === 401) {
                            this.router.navigate(['/auth/login']);
                            return throwError(() => err);
                        }
                        else if (err.status === 403) {
                            this.router.navigate(['/']);
                            return throwError(() => err);
                        } else {
                            //const error = err.message || err.statusText;
                            return throwError(() => err);
                        }
                    }
                )
            );
    }
}
