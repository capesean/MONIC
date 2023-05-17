import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ImportService {

    constructor(private http: HttpClient) {
    }

    importCSV(fileContents: string): Observable<void> {
        return this.http.post<void>(`${environment.baseApiUrl}import/csv`, { fileContents });
    }

}
