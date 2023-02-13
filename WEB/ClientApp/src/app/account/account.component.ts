import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ScrollSpyService } from '../common/spy/scroll-spy.service';
//import { ScrollSpyService } from 'ng-spy';

@Component({
    selector: 'app-account',
    templateUrl: './account.component.html'
})
export class AccountComponent implements OnInit, AfterViewInit {

    // todo: remove this
    public rootPath = "https://d33wubrfki0l68.cloudfront.net/053f2dfd0df2f52c41e903a21d177b0b44abc9b1/1282c";
    public activeTarget: string;

    @ViewChild('basicInformationSection', { static: true }) basicInformationSection: ElementRef;
    @ViewChild('usernameSection', { static: true }) usernameSection: ElementRef;
    @ViewChild('formTest', { static: true }) formTest: ElementRef;
    

    constructor(
        private element: ElementRef,
        private spyService: ScrollSpyService
    ) {
        //this.spyService.addTarget('basicInformationSection'(
        //console.warn(this.spyService.activeSpyTarget);
        this.spyService.activeSpyTarget.subscribe(
            (activeTargetName: string) => console.log(activeTargetName)
        );
    }

    ngOnInit(): void {
        this.spyService.addTarget({ name: 'basicInformationSection', element: this.basicInformationSection });
        this.spyService.addTarget({ name: 'usernameSection', element: this.usernameSection });
    }

    ngAfterViewInit(): void {
        //this.spyService.spy({ scrollContainer: this.formTest });
        this.spyService.spy({ thresholdBottom: 50 });
    }
}

