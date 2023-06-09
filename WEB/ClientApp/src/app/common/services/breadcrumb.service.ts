import { Injectable, EventEmitter } from '@angular/core';
import { Router, ActivatedRouteSnapshot, Event, NavigationEnd } from '@angular/router';
import { filter, ReplaySubject } from 'rxjs';
import { Breadcrumb } from '../models/breadcrumb.model';

@Injectable({
    providedIn: 'root',
})
@Injectable()
export class BreadcrumbService {
    breadcrumbChanged = new ReplaySubject<Breadcrumb[]>();

    private breadcrumbs = new Array<Breadcrumb>();

    constructor(private router: Router) {
        this.router.events
            .pipe(filter(event => event instanceof NavigationEnd))
            .subscribe(() => { this.onRouteEvent(); });
    }

    public changeBreadcrumb(route: ActivatedRouteSnapshot, name: string) {
        const rootUrl = this.createRootUrl(route);
        const breadcrumb = this.breadcrumbs.find(function (bc) { return bc.url === rootUrl; });

        if (!breadcrumb) return;

        breadcrumb.displayName = name;

        this.breadcrumbChanged.next(this.breadcrumbs);
    }

    private onRouteEvent() {

        let route = this.router.routerState.root.snapshot;
        let url = '';

        var breadCrumbIndex = 0;
        var newCrumbs = [];

        while (route.firstChild != null) {
            route = route.firstChild;

            if (route.routeConfig === null) { continue; }
            if (!route.routeConfig.path) { continue; }

            url += `/${this.createUrl(route)}`;

            if (!(route.data as any)?.breadcrumb) { continue; }

            var newCrumb = this.createBreadcrumb(route, url)

            if (breadCrumbIndex < this.breadcrumbs.length) {
                var existing = this.breadcrumbs[breadCrumbIndex++];

                if (existing && existing.route == route.routeConfig) {
                    newCrumb.displayName = existing.displayName;
                }
            }

            newCrumbs.push(newCrumb);
        }

        this.breadcrumbs = newCrumbs;
        this.breadcrumbChanged.next(this.breadcrumbs);
    }

    private createBreadcrumb(route: ActivatedRouteSnapshot, url: string): Breadcrumb {
        return {
            displayName: (route.data as any)?.breadcrumb,
            terminal: this.isTerminal(route),
            url: url,
            route: route.routeConfig
        }
    }

    private isTerminal(route: ActivatedRouteSnapshot) {
        return route.firstChild === null
            || route.firstChild.routeConfig === null
            || !route.firstChild.routeConfig.path;
    }

    private createUrl(route: ActivatedRouteSnapshot) {
        return route.url.map(function (s) { return s.toString(); }).join('/');
    }

    private createRootUrl(route: ActivatedRouteSnapshot) {
        let url = '';
        let next = route.root;

        while (next.firstChild !== null) {
            next = next.firstChild;

            if (next.routeConfig === null) { continue; }
            if (!next.routeConfig.path) { continue; }

            url += `/${this.createUrl(next)}`;

            if (next === route) { break; }
        }

        return url;
    }
}
