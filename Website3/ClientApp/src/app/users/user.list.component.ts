import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { PagingOptions } from '../common/models/http.model';
import { ErrorService } from '../common/services/error.service';
import { UserSearchOptions, UserSearchResponse, User } from '../common/models/user.model';
import { UserService } from '../common/services/user.service';
import { Roles } from '../common/models/roles.model';

@Component({
    selector: 'user-list',
    templateUrl: './user.list.component.html'
})
export class UserListComponent implements OnInit {

    public users: User[] = [];
    public searchOptions = new UserSearchOptions();
    public headers = new PagingOptions();
    private routerSubscription: Subscription;
    public roles = Roles.List;

    constructor(
        public route: ActivatedRoute,
        private router: Router,
        private errorService: ErrorService,
        private userService: UserService
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

    runSearch(pageIndex = 0): Subject<UserSearchResponse> {

        this.searchOptions.pageIndex = pageIndex;

        const subject = new Subject<UserSearchResponse>();

        this.userService.search(this.searchOptions)
            .subscribe(
                response => {
                    subject.next(response);
                    this.users = response.users;
                    this.headers = response.headers;
                },
                err => {
                    this.errorService.handleError(err, "Users", "Load");
                }
            );

        return subject;

    }

    goToUser(user: User): void {
        this.router.navigate([user.id], { relativeTo: this.route });
    }
}

