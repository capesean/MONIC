import { CanActivateChild, ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, Router, Params } from '@angular/router';
import { Injectable } from '@angular/core';
import { AuthService } from '../../common/services/auth.service';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class AccessGuard implements CanActivateChild, CanActivate {

    constructor(
        private authService: AuthService,
        private router: Router
    ) { }

    canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        // todo: if can't active, then go to login?
        return this.checkParents(childRoute, state);
    }

    canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        // todo: if can't active, then go to login?
        return this.checkParents(next, state);
    }

    private checkParents(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

        // todo: send to login with returnUrl: https://www.tektutorialshub.com/angular/angular-canactivate-guard-example/
        return this.authService.loggedIn$
            .pipe(
                tap(loggedIn => {
                    if (!loggedIn) {
                        let url = state.url.startsWith("/auth") ? "" : state.url;
                        const queryParams = {} as Params;
                        if (url && url !== "/") queryParams.path = encodeURIComponent(url);
                        this.router.navigate(["/auth/login"], { queryParamsHandling: "merge", queryParams: queryParams });
                    }
                })
            );

        return true;
    }

}
