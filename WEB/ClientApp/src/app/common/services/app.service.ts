import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, } from '@angular/common/http';
import { AsyncSubject } from 'rxjs';
import { ErrorService } from './error.service';
import { FieldData } from '../models/fielddata.model';

@Injectable({ providedIn: 'root' })
export class AppService {

    constructor(
        private http: HttpClient,
        private errorService: ErrorService
    ) {
    }

    private _fieldData$: AsyncSubject<FieldData>;
    public getFieldData(): AsyncSubject<FieldData> {

        // todo: getProfile should be like this?
        if (!this._fieldData$) {
            this._fieldData$ = new AsyncSubject<FieldData>();
            this.http
                .get<FieldData>(`${environment.baseApiUrl}app/fielddata`)
                .subscribe(
                    o => {
                        this._fieldData$.next(o);
                        this._fieldData$.complete();
                    },
                    err => {
                        this.errorService.handleError(err, "Field Data", "Load")
                    });
        }
        return this._fieldData$;
    }

}
