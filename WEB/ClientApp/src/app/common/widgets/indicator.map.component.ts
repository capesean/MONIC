import { Component as NgComponent, Input, OnInit, Output, EventEmitter, NgZone } from '@angular/core';
import * as d3 from 'd3';
import { EChartsOption } from 'echarts/types/dist/shared';
import { combineLatest, forkJoin } from 'rxjs';
import { Datum, DatumSearchOptions } from '../models/datum.model';
import { AppDate } from '../models/date.model';
import { FeatureCollection, Polygon, MultiPolygon } from 'geojson';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Indicator } from '../models/indicator.model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmModalComponent, ConfirmModalOptions } from '../components/confirm.component';
import { IndicatorMapSettings, Widget } from '../models/widget.model';
import { Observable } from 'rxjs';
import { GoogleMapsApiService } from '../services/googlemapsapi.service';
import { UtilitiesService } from '../services/utilities.service';
import { Subject } from 'rxjs';
import { ViewChild } from '@angular/core';
import { IndicatorMapInfoWindowComponent } from './indicator.map.infowindow.component';
import { WidgetService } from '../services/widget.service';

@NgComponent({
    selector: 'app-indicator-map',
    templateUrl: './indicator.map.component.html',
    standalone: false
})
export class IndicatorMapComponent implements OnInit, Widget {

    @Output() loading: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() error: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() title: EventEmitter<string> = new EventEmitter<string>(true);
    @Output() subtitle: EventEmitter<string> = new EventEmitter<string>();

    private _settings: IndicatorMapSettings;
    @Input() set settings(s: IndicatorMapSettings) {
        if (!s) return;
        this._settings = s;
        this.height = this.utilitiesService.getHeight(s.height);
        this.load();
    }

    public zoom = 1;
    public center: google.maps.LatLngLiteral = { lat: 0, lng: 0 };

    public height = 200;
    public chartOptions: EChartsOption;

    public geoJson: FeatureCollection;
    public apiLoaded: Observable<boolean>;

    private mapReady = new Subject<google.maps.Map>();
    private geoJsonReady = new Subject<FeatureCollection>();
    @ViewChild("infoWindow") infoWindow: any;

    private data: Datum[];
    private max: number;
    private min: number;

    public loaded = false;

    public indicator: Indicator;
    public date: AppDate;

    public datum: Datum;

    constructor(
        private http: HttpClient,
        private modalService: NgbModal,
        private mapService: GoogleMapsApiService,
        private utilitiesService: UtilitiesService,
        private zone: NgZone,
        private widgetService: WidgetService
    ) {
        // configure map when ready
        this.mapReady.subscribe(map => {

            map.setOptions({ streetViewControl: false, fullscreenControl: false, zoomControl: false, controlSize: 20 });
            map.data.setStyle(this.getStyle);

            map.data.addListener("click", ($event: google.maps.Data.MouseEvent) => {
                // run in the angular context for access to controller
                this.zone.run(() => this.showInfoWindow($event));
            });

        });

        // add geojson when map & geojson are ready
        combineLatest({ map: this.mapReady, geoJson: this.geoJsonReady })
            .subscribe(result => {
                
                if (result.map?.data)
                    result.map.data.forEach((feature) => {
                        result.map.data.remove(feature);
                    });

                result.map.data.addGeoJson(result.geoJson);
                result.map.fitBounds(this.getBounds(result.geoJson));
            });

    }

    ngOnInit(): void {
        this.apiLoaded = this.mapService.load();
    }

    public load(): void {

        if (!this._settings.indicatorId || !this._settings.dateId || !this._settings.entityTypeId) {
            this.loading.emit(false);
            this.error.emit(true);
            return;
        }

        this.loading.emit(true);

        forkJoin({
            widget: this.widgetService.load2(this._settings.indicatorId, this._settings.entityTypeId, this._settings.dateId),
            geoJson: this.http.get<FeatureCollection>(`${environment.baseUrl}assets/geojson/${this._settings.entityTypeId}.json`, { observe: 'response' })
        }).subscribe({
            next: response => {

                this.data = response.widget.data;
                this.indicator = response.widget.indicator;
                this.date = response.widget.date;

                this.title.emit(this.indicator.name);
                this.subtitle.emit(this.date.name);

                this.indicator.entityType = response.widget.entityType;
                this.data.forEach(datum => {
                    datum.entity = response.widget.entities.find(o => o.entityId === datum.entityId);
                    datum.date = this.date;
                });

                // these need cacheing?
                this.geoJson = response.geoJson.body;
                this.geoJsonReady.next(this.geoJson)

                const values = this.data.filter(o => o.value != null).map(o => o.value);
                this.max = Math.max(...values);
                this.min = Math.min(...values);

                this.error.emit(false);
                this.loading.emit(false);

            },
            error: () => {
                this.loading.emit(false);
                this.error.emit(true);
            }

        });
    }

    // declared as a function so that 'this' is the component
    getStyle = (feature: google.maps.Data.Feature): google.maps.Data.StyleOptions => {
        let color = 'grey';

        if (this.data) {
            const id = feature.getProperty("id");
            const datum = this.data.find(o => o.entity.code === id);
            if (datum && datum.value != null) {
                const percent = (datum.value - this.min) / (this.max - this.min);
                color = d3.scaleLinear<string>().domain([0, 1])
                    .range([this._settings.minColor, this._settings.maxColor])(percent);
            }
        }
        return ({
            clickable: true,
            fillColor: color,
            strokeWeight: 0.25,
            fillOpacity: this._settings.opacity
        });
    }

    onMapReady(map: google.maps.Map) {

        // run in the angular context for access to controller
        this.zone.run(() => this.mapReady.next(map));

        // let the geojson zoom & pan the map
        //setTimeout(() => {
        //    map.setZoom(this.zoom);
        //    map.panTo(this.center);
        //}, 1000);

    }

    private showInfoWindow($event: google.maps.Data.MouseEvent): void {
        const feature = $event.feature;
        const id = feature.getProperty("id")
        this.datum = this.data.find(o => o.entity.code === id);

        if (!this.datum) {
            const modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
            (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Map Click", text: `<p class="mb-5">There is no data for the ${this.indicator.entityType.name.toLowerCase()} that was clicked (${id})</p>`, ok: "Close", cancel: undefined } as ConfirmModalOptions;
            return;
        }

        const modal = this.modalService.open(IndicatorMapInfoWindowComponent);
        (modal.componentInstance as IndicatorMapInfoWindowComponent).datum = this.datum;
        (modal.componentInstance as IndicatorMapInfoWindowComponent).indicator = this.indicator;
    }

    private getBounds(geoJson: FeatureCollection): google.maps.LatLngBounds {

        const bounds = new google.maps.LatLngBounds();

        if (!geoJson) return bounds;

        for (const feature of geoJson.features) {
            const geometry = feature.geometry;
            if (geometry.type === "Polygon") {
                (feature.geometry as Polygon).coordinates.forEach(latlngs => {
                    latlngs.forEach(latlng => {
                        bounds.extend({ lng: latlng[0], lat: latlng[1] });
                    });
                });
            } else if (geometry.type === "MultiPolygon") {
                (feature.geometry as MultiPolygon).coordinates.forEach(polygon => {
                    polygon.forEach(latlngs => {
                        latlngs.forEach(latlng => {
                            bounds.extend({ lng: latlng[0], lat: latlng[1] });
                        });
                    });
                });
            }
        }

        return bounds;
    }
}

