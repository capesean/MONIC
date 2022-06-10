import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { share, tap } from "rxjs/operators";
import { environment } from "../../../environments/environment";
import { ProfileModel } from "../models/profile.models";

@Injectable({ providedIn: 'root' })
export class ProfileService {

    protected _profile: ProfileModel;
    private profileGet: Observable<ProfileModel>;

    constructor(
        private http: HttpClient
    ) {
    }

    getProfile(refresh?: boolean): Observable<ProfileModel> {
        // if the profile has already been retrieved, return it
        if (!refresh && this._profile) {
            return of(this._profile);
        }
        // if a request is currently outstanding, return that request
        if (!this.profileGet) {
            this.profileGet = this.http
                .get<ProfileModel>(`${environment.baseApiUrl}profile`)
                .pipe(share())
                .pipe(tap(profile => {
                    this._profile = profile;
                    // clear the outstanding request
                    this.profileGet = undefined;
                }));
        }
        return this.profileGet;
    }

    clearProfile(): void {
        this._profile = undefined;
    }

}
