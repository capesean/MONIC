import { Component, OnInit } from '@angular/core';
import { ProfileModel } from '../common/models/profile.models';
import { ProfileService } from '../common/services/profile.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {

    profile: ProfileModel;

    constructor(private profileService: ProfileService) {
    }

    ngOnInit(): void {
        this.profileService.getProfile()
            .subscribe(profile => this.profile = profile);
    }


}
