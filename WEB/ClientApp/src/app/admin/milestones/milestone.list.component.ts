import { Component as NgComponent, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PagingHeaders } from '../../common/models/http.model';
import { MilestoneSearchOptions, MilestoneSearchResponse, Milestone } from '../../common/models/milestone.model';
import { ErrorService } from '../../common/services/error.service';
import { MilestoneService } from '../../common/services/milestone.service';
import { MilestoneSortComponent } from './milestone.sort.component';

@NgComponent({
    selector: 'milestone-list',
    templateUrl: './milestone.list.component.html'
})
export class MilestoneListComponent implements OnInit, OnDestroy {

    public milestones: Milestone[] = [];
    public searchOptions = new MilestoneSearchOptions();
    public headers = new PagingHeaders();
    private routerSubscription: Subscription;

    constructor(
        public route: ActivatedRoute,
        private router: Router,
        private errorService: ErrorService,
        private modalService: NgbModal,
        private milestoneService: MilestoneService
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

    runSearch(pageIndex = 0): Subject<MilestoneSearchResponse> {

        this.searchOptions.pageIndex = pageIndex;

        const subject = new Subject<MilestoneSearchResponse>();

        this.milestoneService.search(this.searchOptions)
            .subscribe({
                next: response => {
                    subject.next(response);
                    this.milestones = response.milestones;
                    this.headers = response.headers;
                },
                error: err => {
                    this.errorService.handleError(err, "Milestones", "Load");
                }
            });

        return subject;

    }

    showSort(): void {
        let modalRef = this.modalService.open(MilestoneSortComponent, { size: 'xl', centered: true, scrollable: false });
        modalRef.result.then(
            () => {

                this.searchOptions.orderBy = null;
                this.runSearch(this.headers.pageIndex);

            }, () => { });
    }

    goToMilestone(milestone: Milestone): void {
        this.router.navigate(["/projects", milestone.project.projectId, "milestones", milestone.milestoneId]);
    }
}

