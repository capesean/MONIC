import { Component as NgComponent, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { PagingHeaders } from '../../common/models/http.model';
import { UserSearchOptions, UserSearchResponse, User } from '../../common/models/user.model';
import { FadeThenShrink } from '../../common/animations/fadethenshrink';
import { Enums } from '../../common/models/enums.model';
import { ErrorService } from '../../common/services/error.service';
import { UserService } from '../../common/services/user.service';

@NgComponent({
    selector: 'user-list',
    templateUrl: './user.list.component.html',
    animations: [FadeThenShrink],
    standalone: false
})
export class UserListComponent implements OnInit, OnDestroy {

    public users: User[] = [];
    public searchOptions = new UserSearchOptions();
    public showSearchOptions = false;
    public headers = new PagingHeaders();
    private routerSubscription: Subscription;
    public roles = Enums.Roles;

    constructor(
        public route: ActivatedRoute,
        private router: Router,
        private errorService: ErrorService,
        private userService: UserService
    ) {
        this.searchOptions.includeParents = true;
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

    runSearch(pageIndex = 0): Subject<UserSearchResponse> {

        this.searchOptions.pageIndex = pageIndex;

        const subject = new Subject<UserSearchResponse>();

        this.userService.search(this.searchOptions)
            .subscribe({
                next: response => {
                    subject.next(response);
                    this.users = response.users;
                    this.headers = response.headers;
                },
                error: err => {
                    this.errorService.handleError(err, "Users", "Load");
                }
            });

        return subject;

    }

    goToUser(user: User): void {
        this.router.navigate([user.id], { relativeTo: this.route });
    }
}

