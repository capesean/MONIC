import { Component as NgComponent, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { PagingHeaders } from '../../common/models/http.model';
import { TokenSearchOptions, TokenSearchResponse, Token } from '../../common/models/token.model';
import { Enum, Enums } from '../../common/models/enums.model';
import { ErrorService } from '../../common/services/error.service';
import { TokenService } from '../../common/services/token.service';

@NgComponent({
    selector: 'token-list',
    templateUrl: './token.list.component.html'
})
export class TokenListComponent implements OnInit, OnDestroy {

    public tokens: Token[] = [];
    public searchOptions = new TokenSearchOptions();
    public headers = new PagingHeaders();
    private routerSubscription: Subscription;
    public tokenTypes: Enum[] = Enums.TokenTypes;

    constructor(
        public route: ActivatedRoute,
        private router: Router,
        private errorService: ErrorService,
        private tokenService: TokenService
    ) {
    }

    ngOnInit(): void {
        this.searchOptions.includeParents = true;
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

    runSearch(pageIndex = 0): Subject<TokenSearchResponse> {

        this.searchOptions.pageIndex = pageIndex;

        const subject = new Subject<TokenSearchResponse>();

        this.tokenService.search(this.searchOptions)
            .subscribe({
                next: response => {
                    subject.next(response);
                    this.tokens = response.tokens;
                    this.headers = response.headers;
                },
                error: err => {
                    this.errorService.handleError(err, "Tokens", "Load");
                }
            });

        return subject;

    }

    goToToken(token: Token): void {
        this.router.navigate([token.indicatorId, token.tokenNumber], { relativeTo: this.route });
    }
}

