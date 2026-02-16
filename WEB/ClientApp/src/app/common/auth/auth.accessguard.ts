import { ActivatedRouteSnapshot, RouterStateSnapshot, Router, Params } from '@angular/router';
import { Injectable } from '@angular/core';
import { AuthService } from '../../common/services/auth.service';
import { Observable } from 'rxjs';
import { map, switchMap, take, tap } from 'rxjs/operators';

@Injectable()
export class AccessGuard {

    constructor(
        private authService: AuthService,
        private router: Router
    ) { }

    canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        return this.checkParents(childRoute, state);
    }

    canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        return this.checkParents(next, state);
    }

    private checkParents(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {

        // Ensure the auth context is fully initialized BEFORE deciding.
        return this.authService.initialize().pipe(
            switchMap(() => this.authService.loggedIn$.pipe(take(1))),
            tap(loggedIn => {
                if (!loggedIn) {
                    const url = state.url.startsWith("/auth") ? "" : state.url;
                    const queryParams = {} as Params;
                    if (url && url !== "/") queryParams.path = encodeURIComponent(url);
                    this.router.navigate(["/auth/login"], { queryParamsHandling: "merge", queryParams });
                }
            }),
            map(loggedIn => loggedIn)
        );
    }

}
