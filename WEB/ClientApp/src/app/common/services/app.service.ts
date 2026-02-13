import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AppService {

    constructor(
        private http: HttpClient
    ) {
    }

    setupCheck(): Observable<{ setupCompleted: boolean }> {
        return this.http
            .get<{ setupCompleted: boolean }>(`${environment.baseApiUrl}app/setupcheck`)
    }

}
