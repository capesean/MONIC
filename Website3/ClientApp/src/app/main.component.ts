import { Component, OnInit, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Component({
    selector: 'main-root',
    templateUrl: './main.component.html'
})
export class MainComponent implements OnInit {

    constructor(
        @Inject(DOCUMENT) private document: Document
    ) {
    }

    ngOnInit() {
        this.document.body.id = "app";
    }
}
