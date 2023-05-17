import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { catchError, map, share, tap } from "rxjs/operators";

@Injectable({ providedIn: 'root' })
export class GoogleMapsApiService {

    private _loaded: boolean;
    private observable: Observable<boolean>;

    constructor(
        private http: HttpClient
    ) {
    }

    load(): Observable<boolean> {
        // if the api has already been loaded, return true to indicate it has been completed
        if (this._loaded) return of(this._loaded);

        // if a request to load (observable) is NOT currently outstanding, create the request (observable)
        if (!this.observable) {

            this.observable = this.http.jsonp('https://maps.googleapis.com/maps/api/js?key=AIzaSyDRMRtbvikjPpOUpLbRu9HluhD0HLSFvKk', 'callback')
                .pipe(
                    map(() => true),
                    share(),
                    tap(() => {
                        this._loaded = true;
                        // clear the outstanding request
                        this.observable = undefined;
                    }),
                    catchError(err => {
                        console.error(err);
                        return of(false);
                    })
                );
        }

        // return the observable
        return this.observable;
    }
}
