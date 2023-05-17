import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Token, TokenSearchOptions, TokenSearchResponse } from '../models/token.model';
import { SearchQuery, PagingHeaders } from '../models/http.model';

@Injectable({ providedIn: 'root' })
export class TokenService extends SearchQuery {

    constructor(private http: HttpClient) {
        super();
    }

    search(params: TokenSearchOptions): Observable<TokenSearchResponse> {
        const queryParams: HttpParams = this.buildQueryParams(params);
        return this.http.get(`${environment.baseApiUrl}tokens`, { params: queryParams, observe: 'response' })
            .pipe(
                map(response => {
                    const headers = JSON.parse(response.headers.get("x-pagination")) as PagingHeaders;
                    const tokens = response.body as Token[];
                    return { tokens: tokens, headers: headers };
                })
            );
    }

    get(indicatorId: string, tokenNumber: number): Observable<Token> {
        return this.http.get<Token>(`${environment.baseApiUrl}tokens/${indicatorId}/${tokenNumber}`);
    }

    save(token: Token): Observable<Token> {
        return this.http.post<Token>(`${environment.baseApiUrl}tokens/${token.indicatorId}/${token.tokenNumber}`, token);
    }

    delete(indicatorId: string, tokenNumber: number): Observable<void> {
        return this.http.delete<void>(`${environment.baseApiUrl}tokens/${indicatorId}/${tokenNumber}`);
    }

}
