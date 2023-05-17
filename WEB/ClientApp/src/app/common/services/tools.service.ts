import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ToolsService {

    constructor(private http: HttpClient) {
    }

    uploadGeoJson(entityTypeId: string, fileContents: string): Observable<void> {
        return this.http.post<void>(`${environment.baseApiUrl}tools/geojson/${entityTypeId}`, { fileContents });
    }

}
