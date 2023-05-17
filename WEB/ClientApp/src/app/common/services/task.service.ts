import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Task, TaskSearchOptions, TaskSearchResponse } from '../models/task.model';
import { SearchQuery, PagingHeaders } from '../models/http.model';

@Injectable({ providedIn: 'root' })
export class TaskService extends SearchQuery {

    constructor(private http: HttpClient) {
        super();
    }

    search(params: TaskSearchOptions): Observable<TaskSearchResponse> {
        const queryParams: HttpParams = this.buildQueryParams(params);
        return this.http.get(`${environment.baseApiUrl}tasks`, { params: queryParams, observe: 'response' })
            .pipe(
                map(response => {
                    const headers = JSON.parse(response.headers.get("x-pagination")) as PagingHeaders;
                    const tasks = response.body as Task[];
                    return { tasks: tasks, headers: headers };
                })
            );
    }

    get(taskId: string): Observable<Task> {
        return this.http.get<Task>(`${environment.baseApiUrl}tasks/${taskId}`);
    }

    save(task: Task): Observable<Task> {
        return this.http.post<Task>(`${environment.baseApiUrl}tasks/${task.taskId}`, task);
    }

    delete(taskId: string): Observable<void> {
        return this.http.delete<void>(`${environment.baseApiUrl}tasks/${taskId}`);
    }

}
