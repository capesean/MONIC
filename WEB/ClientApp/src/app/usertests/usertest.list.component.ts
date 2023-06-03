import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PagingHeaders } from '../common/models/http.model';
import { UserTestSearchOptions, UserTestSearchResponse, UserTest } from '../common/models/usertest.model';
import { ErrorService } from '../common/services/error.service';
import { UserTestService } from '../common/services/usertest.service';
import { UserTestSortComponent } from './usertest.sort.component';

@Component({
    selector: 'usertest-list',
    templateUrl: './usertest.list.component.html'
})
export class UserTestListComponent implements OnInit {

    public userTests: UserTest[] = [];
    public searchOptions = new UserTestSearchOptions();
    public headers = new PagingHeaders();

    constructor(
        public route: ActivatedRoute,
        private router: Router,
        private errorService: ErrorService,
        private modalService: NgbModal,
        private userTestService: UserTestService
    ) {
    }

    ngOnInit(): void {
        this.searchOptions.includeParents = true;
        this.runSearch();
    }

    runSearch(pageIndex = 0, orderBy: string = null): Subject<UserTestSearchResponse> {

        this.searchOptions.pageIndex = pageIndex;

        if (orderBy != null) {
            if (this.searchOptions.orderBy === orderBy)
                this.searchOptions.orderByAscending = this.searchOptions.orderByAscending == null ? true : !this.searchOptions.orderByAscending;
            else {
                this.searchOptions.orderBy = orderBy;
                this.searchOptions.orderByAscending = true;
            }
        }

        const subject = new Subject<UserTestSearchResponse>();

        this.userTestService.search(this.searchOptions)
            .subscribe({
                next: response => {
                    subject.next(response);
                    this.userTests = response.userTests;
                    this.headers = response.headers;
                },
                error: err => {
                    this.errorService.handleError(err, "User Tests", "Load");
                }
            });

        return subject;

    }

    showSort(): void {
        let modalRef = this.modalService.open(UserTestSortComponent, { size: 'xl', centered: true, scrollable: true });
        modalRef.result.then(
            () => {

                this.searchOptions.orderBy = null;
                this.runSearch(this.headers.pageIndex);

            }, () => { });
    }

    goToUserTest(userTest: UserTest): void {
        this.router.navigate(["/users", userTest.user.id, "usertests", userTest.userTestId]);
    }
}

