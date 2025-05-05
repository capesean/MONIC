import { Component as NgComponent, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PagingHeaders } from '../../common/models/http.model';
import { GroupSearchOptions, GroupSearchResponse, Group } from '../../common/models/group.model';
import { FadeThenShrink } from '../../common/animations/fadethenshrink';
import { ErrorService } from '../../common/services/error.service';
import { GroupService } from '../../common/services/group.service';
import { GroupSortComponent } from './group.sort.component';

@NgComponent({
    selector: 'group-list',
    templateUrl: './group.list.component.html',
    animations: [FadeThenShrink],
    standalone: false
})
export class GroupListComponent implements OnInit, OnDestroy {

    public groups: Group[] = [];
    public searchOptions = new GroupSearchOptions();
    public showSearchOptions = false;
    public headers = new PagingHeaders();
    private routerSubscription: Subscription;

    constructor(
        public route: ActivatedRoute,
        private router: Router,
        private errorService: ErrorService,
        private modalService: NgbModal,
        private groupService: GroupService
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

    runSearch(pageIndex = 0): Subject<GroupSearchResponse> {

        this.searchOptions.pageIndex = pageIndex;

        const subject = new Subject<GroupSearchResponse>();

        this.groupService.search(this.searchOptions)
            .subscribe({
                next: response => {
                    subject.next(response);
                    this.groups = response.groups;
                    this.headers = response.headers;
                },
                error: err => {
                    this.errorService.handleError(err, "Groups", "Load");
                }
            });

        return subject;

    }

    showSort(): void {
        let modalRef = this.modalService.open(GroupSortComponent, { size: 'xl', centered: true, scrollable: false });
        modalRef.result.then(
            () => {

                this.searchOptions.orderBy = null;
                this.runSearch(this.headers.pageIndex);

            }, () => { });
    }

    goToGroup(group: Group): void {
        this.router.navigate([group.groupId], { relativeTo: this.route });
    }
}

