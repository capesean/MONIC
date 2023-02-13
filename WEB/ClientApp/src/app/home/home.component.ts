import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ProfileModel } from '../common/models/profile.models';
import { AuthService } from '../common/services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {

    profile: ProfileModel;

    @ViewChild('target1', { static: true }) target1: ElementRef;
    @ViewChild('target2', { static: true }) target2: ElementRef;
    @ViewChild('target3', { static: true }) target3: ElementRef;
    @ViewChild('target4', { static: true }) target4: ElementRef;

    constructor(
        private authService: AuthService
    ) {
    }

    ngOnInit(): void {
        this.authService.getProfile()
            .subscribe(profile => this.profile = profile);
    }

}
