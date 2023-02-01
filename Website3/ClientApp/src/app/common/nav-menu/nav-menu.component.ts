import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { ProfileModel } from '../models/profile.models';
import { AuthService } from '../services/auth.service';

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
    public adminCollapsed = true;

    constructor(
        private authService: AuthService,
        private toastr: ToastrService,
        private router: Router
    ) {
        if (router.url === '/') { }
        else if (router.url.startsWith('/settings')
            || router.url.startsWith('/users')
        )
            this.adminCollapsed = false;
    }

    ngOnInit(): void {
        this.authService.getProfile().subscribe(profile => this.profile = profile);
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
