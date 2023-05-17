import { Component } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { Datum } from "../models/datum.model";
import { Indicator } from "../models/indicator.model";

@Component({
    selector: 'app-indicator-map-info-window',
    templateUrl: './indicator.map.infowindow.component.html'
})
export class IndicatorMapInfoWindowComponent {

    public datum: Datum;
    public indicator: Indicator;

    constructor(public modal: NgbActiveModal) { }

}
