import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DateTypes } from '../models/enums.model';
import { Indicator } from '../models/indicator.model';
import { Entity } from '../models/entity.model';
import { Datum } from '../models/datum.model';
import { AppDate } from '../models/date.model';

export class WidgetResponse {
    indicator: Indicator;
    entities: Entity[];
    dates: AppDate[];
    data: Datum[];
}

@Injectable({ providedIn: 'root' })
export class WidgetService {

    constructor(private http: HttpClient) {
    }

    load(indicatorId: string, entityIds: string[], dateType: DateTypes): Observable<WidgetResponse> {
        return this.http.post<WidgetResponse>(`${environment.baseApiUrl}widget`, { indicatorId, entityIds, dateType });
    }

}
