import { Component, OnInit, Inject } from '@angular/core'
import { DOCUMENT } from '@angular/common';

@Component({
    selector: 'public-root',
    templateUrl: './public.component.html'
})
export class PublicComponent implements OnInit {

    constructor(
        @Inject(DOCUMENT) private document: Document,
    ) { }

    ngOnInit(): void {
        this.document.body.id = "public";
    }

}
