import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import { SetupModel } from "../models/setup.models";

@Injectable({ providedIn: 'root' })
export class SetupService {

    constructor(
        private http: HttpClient
    ) {
    }

    checkSetup() {
        return this.http.get<{ runSetup: boolean }>(`${environment.baseApiUrl}setup`);
    }

    runSetup(setupModel: SetupModel) {
        return this.http.post<Response>(`${environment.baseApiUrl}setup`, setupModel);
    }

}
