import { Component, Inject, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import { environment } from '../../../environments/environment';
import { Options } from '@popperjs/core';
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { BreadcrumbService } from '../services/breadcrumb.service';
import { Breadcrumb } from '../models/breadcrumb.model';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

    // todo: set types
    public breadcrumbs: any[];
    public home: any = { icon: 'pi pi-home', routerLink: ['/'] };;
    public rootPath = "https://d33wubrfki0l68.cloudfront.net/053f2dfd0df2f52c41e903a21d177b0b44abc9b1/1282c";

    popperOptions = (options: Partial<Options>) => {
        options.modifiers.push({
            name: 'offset',
            options: {
                offset: [0, 20],
            },
        });
        return options;
    };

    constructor(
        private titleService: Title,
        private breadcrumbService: BreadcrumbService,
        @Inject(DOCUMENT) private document: Document,
        private offcanvasService: NgbOffcanvas,
        private toastr: ToastrService,
        private router: Router,
        private authService: AuthService
    ) {
        console.warn("todo: set breadcrumbs & home types");
        this.breadcrumbService.breadcrumbChanged.subscribe((crumbs) => {
            debugger;
            //if (crumbs.length) this.breadcrumbs = crumbs.map(c => this.toPrimeNgMenuItem(c));
            //else this.breadcrumbs = [{ label: 'Home', routerLink: ['/'] }];
            //this.titleService.setTitle(this.createTitle(crumbs));
        });
    }

    ngOnInit(): void {        
    }

    public offCanvas(content: any, position: 'start' | 'end' | 'top' | 'bottom' = 'start') {
        this.offcanvasService.open(content, { position: position });
    }

    private createTitle(routesCollection: Breadcrumb[]) {
        const title = environment.siteName;
        const titles = routesCollection.filter((route) => route.displayName);

        if (!titles.length) { return title; }

        const routeTitle = this.titlesToString(titles);
        return `${routeTitle} ${title}`;
    }

    private titlesToString(titles: any[]) {
        return titles.reduce((prev, curr) => {
            return `${curr.displayName} - ${prev}`;
        }, '');
    }

    logout() {
        this.authService.logout();
        this.toastr.success("You have been logged out successfully", "Log Out");
        this.router.navigate(["/auth/login"]);
    }

}
