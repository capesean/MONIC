import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Indicator, IndicatorSearchOptions, IndicatorSearchResponse, MyIndicatorSearchOptions, IndicatorIndicatorsSearchOptions, UnassignedIndicator } from '../models/indicator.model';
import { SearchQuery, PagingHeaders } from '../models/http.model';
import { Permission } from '../models/permission.model';
import { Token } from '../models/token.model';

@Injectable({ providedIn: 'root' })
export class IndicatorService extends SearchQuery {

    constructor(private http: HttpClient) {
        super();
    }

    search(params: IndicatorSearchOptions): Observable<IndicatorSearchResponse> {
        const queryParams: HttpParams = this.buildQueryParams(params);
        return this.http.get(`${environment.baseApiUrl}indicators`, { params: queryParams, observe: 'response' })
            .pipe(
                map(response => {
                    const headers = JSON.parse(response.headers.get("x-pagination")) as PagingHeaders;
                    const indicators = response.body as Indicator[];
                    return { indicators: indicators, headers: headers };
                })
            );
    }

    get(indicatorId: string): Observable<Indicator> {
        return this.http.get<Indicator>(`${environment.baseApiUrl}indicators/${indicatorId}`);
    }

    save(indicator: Indicator): Observable<Indicator> {
        return this.http.post<Indicator>(`${environment.baseApiUrl}indicators/${indicator.indicatorId}`, indicator);
    }

    delete(indicatorId: string): Observable<void> {
        return this.http.delete<void>(`${environment.baseApiUrl}indicators/${indicatorId}`);
    }

    saveFormula(indicatorId: string, tokens: Token[]): Observable<Token[]> {
        return this.http.post<Token[]>(`${environment.baseApiUrl}indicators/${indicatorId}/formula`, tokens);
    }

    calculate(indicatorId: string): Observable<void> {
        return this.http.post<void>(`${environment.baseApiUrl}indicators/${indicatorId}/calculate`, null);
    }

    myIndicators(params: MyIndicatorSearchOptions): Observable<IndicatorSearchResponse> {
        const queryParams: HttpParams = this.buildQueryParams(params);
        return this.http.get(`${environment.baseApiUrl}indicators/myindicators`, { params: queryParams, observe: 'response' })
            .pipe(
                map(response => {
                    const headers = <PagingHeaders>JSON.parse(response.headers.get("x-pagination"))
                    const indicators = <Indicator[]>response.body;
                    return { indicators: indicators, headers: headers };
                })
            );
    }

    getIndicators(params: IndicatorIndicatorsSearchOptions): Observable<IndicatorSearchResponse> {
        const queryParams: HttpParams = this.buildQueryParams(params);
        return this.http.get(`${environment.baseApiUrl}indicators/${params.indicatorId}/indicators`, { params: queryParams, observe: 'response' })
            .pipe(
                map(response => {
                    const headers = <PagingHeaders>JSON.parse(response.headers.get("x-pagination"))
                    const indicators = <Indicator[]>response.body;
                    return { indicators: indicators, headers: headers };
                })
            );
    }

    unassignedIndicators(entityId: string): Observable<UnassignedIndicator[]> {
        return this.http.get<UnassignedIndicator[]>(`${environment.baseApiUrl}indicators/unassignedindicators/${entityId}`);
    }

    getPermissions(indicatorId: string, entityId: string): Observable<Permission[]> {
        return this.http.get<Permission[]>(`${environment.baseApiUrl}indicators/${indicatorId}/permissions` + (entityId ? "?entityId=" + entityId : ""));
    }

    sort(subcategoryId: string, ids: string[]): Observable<void> {
        return this.http.post<void>(`${environment.baseApiUrl}indicators/sort?subcategoryId=${subcategoryId}`, ids);
    }

    deleteLogFrameRowIndicators(indicatorId: string): Observable<void> {
        return this.http.delete<void>(`${environment.baseApiUrl}indicators/${indicatorId}/logframerowindicators`);
    }

    deleteComponentIndicators(indicatorId: string): Observable<void> {
        return this.http.delete<void>(`${environment.baseApiUrl}indicators/${indicatorId}/componentindicators`);
    }

}
