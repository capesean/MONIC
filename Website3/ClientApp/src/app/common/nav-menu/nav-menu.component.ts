import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { Roles } from '../models/roles.model';
import { BehaviorSubject } from 'rxjs';
import { ProfileModel } from '../models/profile.models';
import { AuthService } from '../services/auth.service';
import { ProfileService } from '../services/profile.service';

@Component({
    selector: 'app-nav-menu',
    templateUrl: './nav-menu.component.html',
    styleUrls: ['./nav-menu.component.css']
})
export class NavMenuComponent implements OnInit {

    public isExpanded = false;
    public profile$ = new BehaviorSubject<ProfileModel>(undefined);
    public isAdmin = false;

    constructor(
        private authService: AuthService,
        private profileService: ProfileService,
        private toastr: ToastrService,
        private router: Router
    ) {
    }

    ngOnInit(): void {
        this.profileService.getProfile().subscribe(profile => {
            this.profile$.next(profile);
            this.isAdmin = this.authService.isInRole(profile, Roles.Administrator);
        });
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
