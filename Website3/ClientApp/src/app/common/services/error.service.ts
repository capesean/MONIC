import { Injectable } from "@angular/core";
import { ToastrService } from "ngx-toastr";
import { HttpErrorResponse, HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import { Error, ErrorSearchOptions, ErrorSearchResponse } from "../models/error.model";
import { SearchQuery, PagingOptions } from "../models/http.model";
import { map } from "rxjs/operators";

@Injectable()
export class ErrorService extends SearchQuery {

    constructor(
        private http: HttpClient,
        private toastr: ToastrService
    ) {
        super();
    }

    search(params: ErrorSearchOptions): Observable<ErrorSearchResponse> {
        const queryParams: HttpParams = this.buildQueryParams(params);
        return this.http.get(`${environment.baseApiUrl}errors`, { params: queryParams, observe: 'response' })
            .pipe(
                map(response => {
                    const headers = JSON.parse(response.headers.get("x-pagination")) as PagingOptions;
                    const errors = response.body as Error[];
                    return { errors: errors, headers: headers };
                })
            );
    }

    get(id: string): Observable<Error> {
        return this.http.get<Error>(`${environment.baseApiUrl}errors/${id}`);
    }

    public handleError(err: any, item: string, action: string) {

        let message = `Failed to ${action.toLowerCase()} the ${item.toLowerCase()}`;
        let title = `${action} ${item}`;

        if (err && err instanceof HttpErrorResponse) {
            const httpError = err as HttpErrorResponse;
            if (httpError.status === 0)
                message = "Unable to connect to the web server";
            else if (httpError.status === 500)
                message = "An unexpected error was encountered. The error information has been logged and will be attended to.";
            else if (httpError.status === 400) {
                if (typeof err.error === "object") {
                    message = "";
                    if (err.error instanceof Blob) {
                        const reader = new FileReader();
                        reader.onload = () => {
                            message = reader.result as string;
                            this.toastr.error(message, title, { timeOut: 0 });
                        }
                        reader.readAsText(err.error);
                        return;
                    } else if (err.error.errorDescription) {
                        message = err.error.errorDescription;
                    } else if (err.error.error_description) {
                        message = err.error.error_description;
                    } else if (err.error.errors) {
                        Object.keys(err.error.errors).forEach(key => {
                            message += err.error.errors[key] + "<br/>";
                        })
                    } else {
                        for (const key in err.error) {
                            if (err.error[key])
                                message += err.error[key] + "<br/>";
                        }
                    }
                } else {
                    message = err.error;
                }
            }
            else if (httpError.status === 403)
                message = `You do not have permission to perform that action`;
            else if (httpError.status === 401) {
                message = `You are not logged in`;
            }
            else if (httpError.status === 404) {
                if (action === "Load" || action === "Save" || action === "Delete")
                    message = `The ${item.toLowerCase()} could not be found`;
                else
                    message = `The item could not be found`;
            }
            else {
                if (err.message)
                    message = `${httpError.status}: ${err.message} `;
                else
                    message = `${httpError.status}: ${this.friendlyHttpStatus[httpError.status]} `;
            }

            if (httpError.status) message += ` <span class="badge rounded-pill bg-light text-danger float-end">${httpError.status}</span>`;
        } else {
            if (err.message) message = err.message;
        }

        console.log(err);
        this.toastr.error(message, title, { timeOut: 0, enableHtml: true });
    }

    private friendlyHttpStatus: Record<number, string> = {
        200: 'OK',
        201: 'Created',
        202: 'Accepted',
        203: 'Non-Authoritative Information',
        204: 'No Content',
        205: 'Reset Content',
        206: 'Partial Content',
        300: 'Multiple Choices',
        301: 'Moved Permanently',
        302: 'Found',
        303: 'See Other',
        304: 'Not Modified',
        305: 'Use Proxy',
        306: 'Unused',
        307: 'Temporary Redirect',
        400: 'Bad Request',
        401: 'Unauthorized',
        402: 'Payment Required',
        403: 'Forbidden',
        404: 'Not Found',
        405: 'Method Not Allowed',
        406: 'Not Acceptable',
        407: 'Proxy Authentication Required',
        408: 'Request Timeout',
        409: 'Conflict',
        410: 'Gone',
        411: 'Length Required',
        412: 'Precondition Required',
        413: 'Request Entry Too Large',
        414: 'Request-URI Too Long',
        415: 'Unsupported Media Type',
        416: 'Requested Range Not Satisfiable',
        417: 'Expectation Failed',
        418: 'I\'m a teapot',
        500: 'Internal Server Error',
        501: 'Not Implemented',
        502: 'Bad Gateway',
        503: 'Service Unavailable',
        504: 'Gateway Timeout',
        505: 'HTTP Version Not Supported',
    };
}
