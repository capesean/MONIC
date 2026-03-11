import { Component, OnInit } from '@angular/core';
import { ChartTypes, Serie } from './chart.models';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'serie',
    templateUrl: './serie.component.html',
    standalone: false
})
export class SerieComponent implements OnInit {

    public serie: Serie;
    ChartTypes = ChartTypes;

    constructor(
        public modal: NgbActiveModal
    ) { }

    ngOnInit() {

        

    }
    
}
