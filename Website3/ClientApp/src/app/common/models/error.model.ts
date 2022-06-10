import { SearchOptions, PagingOptions } from './http.model';

export class Error {
    id: string;
    dateUtc: Date;
    message: string;
    url: string;
    form: string;
    userName: string;
    method: string;
    exceptionId: string;
    exception: Exception;
}

export class Exception {
    id: string;
    message: string;
    stackTrace: string;
    innerExceptionId: string;
    innerException: Exception;
}

export class ErrorSearchOptions extends SearchOptions {
}

export class ErrorSearchResponse {
    errors: Error[] = [];
    headers: PagingOptions;
}
