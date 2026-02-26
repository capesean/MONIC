import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AsyncSubject, Observable } from 'rxjs';
import { FieldData } from '../models/fielddata.model';
import { ErrorService } from './error.service';

@Injectable({ providedIn: 'root' })
export class AppService {

    constructor(
        private http: HttpClient,
        private errorService: ErrorService
    ) {
    }

    setupCheck(): Observable<{ setupCompleted: boolean }> {
        return this.http
            .get<{ setupCompleted: boolean }>(`${environment.baseApiUrl}app/setupcheck`)
    }

    private _fieldData$: AsyncSubject<FieldData>;
    public getFieldData(refresh = false): AsyncSubject<FieldData> {

        // todo: getProfile should be like this?
        if (!this._fieldData$ || refresh) {
            this._fieldData$ = new AsyncSubject<FieldData>();
            this.http
                .get<FieldData>(`${environment.baseApiUrl}app/fielddata`)
                .subscribe({
                    next: o => {
                        this._fieldData$.next(o);
                        this._fieldData$.complete();
                    },
                    error: err => {
                        this.errorService.handleError(err, "Field Data", "Load")
                    }
                });
        }
        return this._fieldData$;
    }

}
