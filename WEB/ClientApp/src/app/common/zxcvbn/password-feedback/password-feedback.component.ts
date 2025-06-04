import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'password-feedback',
    templateUrl: './password-feedback.component.html',
    styleUrls: ['./password-feedback.component.css'],
    standalone: false
})
export class PasswordFeedbackComponent implements OnInit {

    @Input()
    feedback = {
        warning: undefined as string,
        suggestions: [] as string[]
    };


    constructor() { }

    ngOnInit() {

    }

}
