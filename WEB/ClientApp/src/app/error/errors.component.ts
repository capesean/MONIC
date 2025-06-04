import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { PagingHeaders } from '../common/models/http.model';
import { ErrorService } from '../common/services/error.service';
import { ErrorSearchOptions, ErrorSearchResponse, Error } from '../common/models/error.model';

@Component({
    selector: 'errors',
    templateUrl: './errors.component.html',
    standalone: false
})
export class ErrorsComponent implements OnInit {

    public errors: Error[] = [];
    public searchOptions = new ErrorSearchOptions();
    public headers = new PagingHeaders();
    private routerSubscription: Subscription;

    constructor(
        public route: ActivatedRoute,
        private router: Router,
        private errorService: ErrorService
    ) {
    }

    ngOnInit(): void {
        this.routerSubscription = this.router.events.subscribe(event => {
            if (event instanceof NavigationEnd && !this.route.firstChild) {
                this.runSearch();
            }
        });
        this.runSearch();
    }

    ngOnDestroy(): void {
        this.routerSubscription.unsubscribe();
    }

    runSearch(pageIndex: number = 0): Observable<ErrorSearchResponse> {

        this.searchOptions.pageIndex = pageIndex;

        var observable = this.errorService
            .search(this.searchOptions);

        observable.subscribe({
            next: response => {
                this.errors = response.errors;
                this.headers = response.headers;
            },
            error: err => {

                this.errorService.handleError(err, "Errors", "Load");

            }
        });

        return observable;

    }

    goToError(error: Error): void {
        this.router.navigate(['/errors', error.id]);
    }
}

