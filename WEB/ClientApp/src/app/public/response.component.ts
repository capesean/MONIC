import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'public-response',
    templateUrl: './response.component.html',
    standalone: false
})
export class ResponseComponent implements OnInit {

    public publicCode: string

    constructor(
        private route: ActivatedRoute,
    ) {
    }

    ngOnInit(): void {

        this.route.params.subscribe(params => {
            this.publicCode = params["publicCode"];
        });

    }

}
