import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Milestone, MilestoneSearchOptions, MilestoneSearchResponse } from '../models/milestone.model';
import { SearchQuery, PagingHeaders } from '../models/http.model';

@Injectable({ providedIn: 'root' })
export class MilestoneService extends SearchQuery {

    constructor(private http: HttpClient) {
        super();
    }

    search(params: MilestoneSearchOptions): Observable<MilestoneSearchResponse> {
        const queryParams: HttpParams = this.buildQueryParams(params);
        return this.http.get(`${environment.baseApiUrl}milestones`, { params: queryParams, observe: 'response' })
            .pipe(
                map(response => {
                    const headers = JSON.parse(response.headers.get("x-pagination")) as PagingHeaders;
                    const milestones = response.body as Milestone[];
                    return { milestones: milestones, headers: headers };
                })
            );
    }

    get(milestoneId: string): Observable<Milestone> {
        return this.http.get<Milestone>(`${environment.baseApiUrl}milestones/${milestoneId}`);
    }

    save(milestone: Milestone): Observable<Milestone> {
        return this.http.post<Milestone>(`${environment.baseApiUrl}milestones/${milestone.milestoneId}`, milestone);
    }

    delete(milestoneId: string): Observable<void> {
        return this.http.delete<void>(`${environment.baseApiUrl}milestones/${milestoneId}`);
    }

    sort(projectId: string, ids: string[]): Observable<void> {
        return this.http.post<void>(`${environment.baseApiUrl}milestones/sort?projectid=${projectId}`, ids);
    }

    deleteTasks(milestoneId: string): Observable<void> {
        return this.http.delete<void>(`${environment.baseApiUrl}milestones/${milestoneId}/tasks`);
    }

}
