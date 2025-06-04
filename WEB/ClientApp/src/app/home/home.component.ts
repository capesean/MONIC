import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ProfileModel } from '../common/models/profile.models';
import { AuthService } from '../common/services/auth.service';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    standalone: false
})
export class HomeComponent implements OnInit {

    profile: ProfileModel;

    constructor(
        private authService: AuthService
    ) {
    }

    ngOnInit(): void {
        this.authService.getProfile()
            .subscribe(profile => this.profile = profile);
    }

}
