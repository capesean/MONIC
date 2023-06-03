import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { NavigationEnd, Router } from '@angular/router';
import { ProfileModel } from '../models/profile.models';
import { AuthService } from '../services/auth.service';
import { ActivatedRoute } from '@angular/router';
import { filter, map, tap } from 'rxjs';

@Component({
    selector: 'app-nav-menu',
    templateUrl: './nav-menu.component.html',
    styleUrls: ['./nav-menu.component.css']
})
export class NavMenuComponent implements OnInit {

    public isExpanded = false;
    public profile: ProfileModel;
    public isAdmin = false;
    public isCollapsed = true;
    public menuStates: { [key: string]: boolean; } = { admin: true, mneTools: true, dashboards: true };
    public activeMenu: string;

    constructor(
        private authService: AuthService,
        private toastr: ToastrService,
        private router: Router,
        private activatedRoute: ActivatedRoute
    ) {
        this.authService.getProfile().subscribe(profile => this.profile = profile);
        let initialized = false;

        this.router
            .events
            .pipe(filter(event => event instanceof NavigationEnd))
            .pipe(map(() => {
                let child = this.activatedRoute.firstChild;
                while (child) {
                    if (child.firstChild) {
                        child = child.firstChild;
                    } else {
                        return (child.snapshot.data as any)?.menu;
                    }
                }
                return null;
            }))
            .subscribe((activeMenu: string) => {
                if (!initialized) {
                    this.menuStates[activeMenu] = false;
                    //if (activeMenu === 'Admin')
                    initialized = true;
                }
                this.activeMenu = activeMenu;
            });
    }

    ngOnInit(): void {
    }

    logout() {
        this.authService.logout();
        this.toastr.success("You have been logged out successfully", "Log Out");
        this.router.navigate(["/auth/login"]);
    }

    toggle() {
        this.isExpanded = !this.isExpanded;
    }
}
