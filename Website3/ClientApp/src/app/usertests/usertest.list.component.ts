import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { PagingHeaders } from '../common/models/http.model';
import { ErrorService } from '../common/services/error.service';
import { UserTestSearchOptions, UserTestSearchResponse, UserTest } from '../common/models/usertest.model';
import { UserTestService } from '../common/services/usertest.service';
import { ToastrService } from 'ngx-toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
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

    runSearch(pageIndex = 0): Subject<UserTestSearchResponse> {

        this.searchOptions.pageIndex = pageIndex;

        const subject = new Subject<UserTestSearchResponse>();

        this.userTestService.search(this.searchOptions)
            .subscribe(
                response => {
                    subject.next(response);
                    this.userTests = response.userTests;
                    this.headers = response.headers;
                },
                err => {
                    this.errorService.handleError(err, "User Tests", "Load");
                }
            );

        return subject;

    }

    showSort() {
        let modalRef = this.modalService.open(UserTestSortComponent, { size: 'xl', centered: true, scrollable: false });
        modalRef.result.then(
            () => {

                this.runSearch(this.headers.pageIndex);

            }, () => { });
    }

    goToUserTest(userTest: UserTest): void {
        this.router.navigate(["/users", userTest.user.id, "usertests", userTest.userTestId]);
    }
}

