import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Datum, DataEntryDatum } from '../models/datum.model';
import { Indicator } from '../models/indicator.model';
import { PermissionTypes, ReviewStatuses } from '../models/enums.model';
import { DataReview } from '../models/datareview.model';

@Injectable({ providedIn: 'root' })
export class FormsService {

    constructor(private http: HttpClient) {
    }

    loadDataEntry(entityId: string, dateId: string, permissionType: PermissionTypes): Observable<DataEntryFormResponse> {
        return this.http.get<DataEntryFormResponse>(`${environment.baseApiUrl}forms/dataentry/${entityId}/${dateId}/${permissionType}`);
    }

    saveDataEntry(entityId: string, dateId: string, data: DataEntryDatum[]): Observable<DataEntryFormResponse> {
        return this.http.post<DataEntryFormResponse>(`${environment.baseApiUrl}forms/dataentry/${entityId}/${dateId}/edit`, data);
    }

    submitDataEntry(entityId: string, dateId: string, indicatorIds: string[]): Observable<DataEntryFormResponse> {
        return this.http.post<DataEntryFormResponse>(`${environment.baseApiUrl}forms/dataentry/${entityId}/${dateId}/submit`, indicatorIds);
    }

    verifyDataEntry(entityId: string, dateId: string, indicatorIds: string[]): Observable<DataEntryFormResponse> {
        return this.http.post<DataEntryFormResponse>(`${environment.baseApiUrl}forms/dataentry/${entityId}/${dateId}/verify`, indicatorIds);
    }

    approveDataEntry(entityId: string, dateId: string, indicatorIds: string[]): Observable<DataEntryFormResponse> {
        return this.http.post<DataEntryFormResponse>(`${environment.baseApiUrl}forms/dataentry/${entityId}/${dateId}/approve`, indicatorIds);
    }

    rejectDataEntry(entityId: string, dateId: string, indicatorIds: string[], status: ReviewStatuses, note: string): Observable<void> {
        return this.http.post<void>(`${environment.baseApiUrl}forms/dataentry/${entityId}/${dateId}/reject/${status}`, { indicatorIds, note });
    }

    getDataReviews(entityId: string, dateId: string, indicatorId: string): Observable<DataReview[]> {
        return this.http.get<DataReview[]>(`${environment.baseApiUrl}forms/dataentry/${entityId}/${dateId}/${indicatorId}/datareviews`);
    }

}

export class DataEntryFormResponse {
    indicators: Indicator[];
    data: Datum[];
}
