import { Component, Inject, OnInit, TemplateRef } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Title } from '@angular/platform-browser';
import { BreadcrumbService, Breadcrumb } from 'angular-crumbs-2';
import { DOCUMENT } from '@angular/common';
import { environment } from '../../../environments/environment';
import { Options } from '@popperjs/core';
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
    
    public breadcrumbs: MenuItem[];
    public home: MenuItem = { icon: 'pi pi-home', routerLink: ['/'] };;
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
        this.breadcrumbService.breadcrumbChanged.subscribe((crumbs) => {
            if (crumbs.length) this.breadcrumbs = crumbs.map(c => this.toPrimeNgMenuItem(c));
            else this.breadcrumbs = [{ label: 'Home', routerLink: ['/'] }];
            this.titleService.setTitle(this.createTitle(crumbs));
        });
    }

    ngOnInit(): void {        
    }

    public offCanvas(content: any, position: 'start' | 'end' | 'top' | 'bottom' = 'start') {
        this.offcanvasService.open(content, { position: position });
    }

    private toPrimeNgMenuItem(crumb: Breadcrumb) {
        return <MenuItem>{ label: crumb.displayName, routerLink: [`${crumb.url}`] }
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
