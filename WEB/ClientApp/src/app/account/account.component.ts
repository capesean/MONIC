import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ScrollSpyService } from 'ng-spy';

@Component({
    selector: 'app-account',
    templateUrl: './account.component.html'
})
export class AccountComponent implements OnInit, AfterViewInit {

    // todo: remove this
    public rootPath = "https://d33wubrfki0l68.cloudfront.net/053f2dfd0df2f52c41e903a21d177b0b44abc9b1/1282c";
    public activeTarget: string;

    constructor(
        private spyService: ScrollSpyService
    ) {
        //this.spyService.addTarget('basicInformationSection'(
        console.warn(this.spyService.activeSpyTarget);
        this.spyService.activeSpyTarget.subscribe(
            (activeTargetName: string) => console.log(activeTargetName)
        );
    }

    ngOnInit(): void {

    }

    ngAfterViewInit(): void {
        this.spyService.spy({ thresholdBottom: 50 });
    }

    setActiveTarget(targetName: string) {
        this.activeTarget = targetName;
    }
}

