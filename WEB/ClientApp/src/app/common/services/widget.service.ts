import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DateTypes } from '../models/enums.model';
import { Indicator } from '../models/indicator.model';
import { Entity } from '../models/entity.model';
import { Datum } from '../models/datum.model';
import { AppDate } from '../models/date.model';
import { EntityType } from '../models/entitytype.model';

export class WidgetLoad1 {
    indicator: Indicator;
    entities: Entity[];
    dates: AppDate[];
    data: Datum[];
}

export class WidgetLoad2 {
    indicator: Indicator;
    entityType: EntityType;
    entities: Entity[];
    date: AppDate;
    data: Datum[];
}

@Injectable({ providedIn: 'root' })
export class WidgetService {

    constructor(private http: HttpClient) {
    }

    load1(indicatorId: string, entityIds: string[], dateType: DateTypes): Observable<WidgetLoad1> {
        return this.http.post<WidgetLoad1>(`${environment.baseApiUrl}widget/load1`, { indicatorId, entityIds, dateType });
    }

    load2(indicatorId: string, entityTypeId: string, dateId: string): Observable<WidgetLoad2> {
        return this.http.post<WidgetLoad2>(`${environment.baseApiUrl}widget/load2`, { indicatorId, entityTypeId, dateId });
    }

}
