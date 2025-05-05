import { Component, Inject, OnInit } from '@angular/core';
import { Options } from '@popperjs/core';
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ProfileModel } from '../models/profile.models';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css'],
    standalone: false
})
export class HeaderComponent implements OnInit {

    popperOptions = (options: Partial<Options>) => {
        options.modifiers.push({
            name: 'offset',
            options: {
                offset: [0, 20],
            },
        });
        return options;
    };

    public profile: ProfileModel;

    constructor(
        private offcanvasService: NgbOffcanvas,
        private toastr: ToastrService,
        private router: Router,
        private authService: AuthService
    ) {
        this.authService.getProfile().subscribe(profile => this.profile = profile);
    }

    ngOnInit(): void {        
    }

    public offCanvas(content: any, position: 'start' | 'end' | 'top' | 'bottom' = 'start') {
        this.offcanvasService.open(content, { position: position });
    }

    logout() {
        this.authService.logout();
        this.toastr.success("You have been logged out successfully", "Log Out");
        this.router.navigate(["/auth/login"]);
    }

}
