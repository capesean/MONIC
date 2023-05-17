import { SearchOptions, PagingHeaders } from './http.model';
import { Indicator } from './indicator.model';
import { OperatorTypes, ParenthesisTypes, TokenTypes } from './enums.model';

export class Token {
    indicatorId: string;
    tokenNumber: number;
    tokenType: TokenTypes;
    number: number;
    operatorType: OperatorTypes;
    parenthesisType: ParenthesisTypes;
    sourceIndicatorId: string;
    convertNullToZero: boolean;
    indicator: Indicator;
    sourceIndicator: Indicator;

    constructor() {
    }
}

export class TokenSearchOptions extends SearchOptions {
    indicatorId: string;
    sourceIndicatorId: string;
}

export class TokenSearchResponse {
    tokens: Token[] = [];
    headers: PagingHeaders;
}
