import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Project, ProjectSearchOptions, ProjectSearchResponse } from '../models/project.model';
import { SearchQuery, PagingHeaders } from '../models/http.model';

@Injectable({ providedIn: 'root' })
export class ProjectService extends SearchQuery {

    constructor(private http: HttpClient) {
        super();
    }

    search(params: ProjectSearchOptions): Observable<ProjectSearchResponse> {
        const queryParams: HttpParams = this.buildQueryParams(params);
        return this.http.get(`${environment.baseApiUrl}projects`, { params: queryParams, observe: 'response' })
            .pipe(
                map(response => {
                    const headers = JSON.parse(response.headers.get("x-pagination")) as PagingHeaders;
                    const projects = response.body as Project[];
                    return { projects: projects, headers: headers };
                })
            );
    }

    get(projectId: string): Observable<Project> {
        return this.http.get<Project>(`${environment.baseApiUrl}projects/${projectId}`);
    }

    save(project: Project): Observable<Project> {
        return this.http.post<Project>(`${environment.baseApiUrl}projects/${project.projectId}`, project);
    }

    delete(projectId: string): Observable<void> {
        return this.http.delete<void>(`${environment.baseApiUrl}projects/${projectId}`);
    }

    deleteMilestones(projectId: string): Observable<void> {
        return this.http.delete<void>(`${environment.baseApiUrl}projects/${projectId}/milestones`);
    }

}
