import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
//import { ScrollSpyService } from 'ng-spy';
import { ProfileModel } from '../common/models/profile.models';
import { AuthService } from '../common/services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit, AfterViewInit {

    profile: ProfileModel;

    @ViewChild('target1', { static: true }) target1: ElementRef;
    @ViewChild('target2', { static: true }) target2: ElementRef;
    @ViewChild('target3', { static: true }) target3: ElementRef;
    @ViewChild('target4', { static: true }) target4: ElementRef;

    constructor(
        private authService: AuthService,
        //private spyService: ScrollSpyService
    ) {
        //this.spyService.addTarget('basicInformationSection'(
        //console.warn(this.spyService.activeSpyTarget);
        //this.spyService.activeSpyTarget.subscribe(
        //    (activeTargetName: string) => console.log(activeTargetName)
        //);
    }

    ngOnInit(): void {
        //this.spyService.addTarget({ name: 'target-1', element: this.target1 });
        //this.spyService.addTarget({ name: 'target-2', element: this.target2 });
        //this.spyService.addTarget({ name: 'target-3', element: this.target3 });
        //this.spyService.addTarget({ name: 'target-4', element: this.target4 });

        this.authService.getProfile()
            .subscribe(profile => this.profile = profile);
    }

    ngAfterViewInit() {
        //this.spyService.spy({ thresholdBottom: 0 });
        //this.spyService.stopSpying();
    }

}
