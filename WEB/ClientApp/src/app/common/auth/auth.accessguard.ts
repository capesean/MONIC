import { ActivatedRouteSnapshot, RouterStateSnapshot, Router, Params } from '@angular/router';
import { Injectable } from '@angular/core';
import { AuthService } from '../../common/services/auth.service';
import { Observable } from 'rxjs';
import { filter, map, take, tap } from 'rxjs/operators';

@Injectable()
export class AccessGuard {

    constructor(
        private authService: AuthService,
        private router: Router
    ) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        return this.checkAccess(state);
    }

    canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        return this.checkAccess(state);
    }

    private checkAccess(state: RouterStateSnapshot): Observable<boolean> {
        return this.authService.state$.pipe(
            map(s => ({ ready: s.authReady, loggedIn: !!s.tokens })),
            filter(x => x.ready),
            take(1),
            tap(x => {
                if (!x.loggedIn) {
                    const url = state.url.startsWith("/auth") ? "" : state.url;
                    const queryParams: Params = {};
                    if (url && url !== "/") queryParams.path = encodeURIComponent(url);
                    this.router.navigate(["/auth/login"], {
                        queryParamsHandling: "merge",
                        queryParams
                    });
                }
            }),
            map(x => x.loggedIn)
        );
    }

}
