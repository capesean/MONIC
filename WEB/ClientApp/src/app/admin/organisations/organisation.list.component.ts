import { Component as NgComponent, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { PagingHeaders } from '../../common/models/http.model';
import { OrganisationSearchOptions, OrganisationSearchResponse, Organisation } from '../../common/models/organisation.model';
import { FadeThenShrink } from '../../common/animations/fadethenshrink';
import { ErrorService } from '../../common/services/error.service';
import { OrganisationService } from '../../common/services/organisation.service';

@NgComponent({
    selector: 'organisation-list',
    templateUrl: './organisation.list.component.html',
    animations: [FadeThenShrink]
})
export class OrganisationListComponent implements OnInit, OnDestroy {

    public organisations: Organisation[] = [];
    public searchOptions = new OrganisationSearchOptions();
    public showSearchOptions = false;
    public headers = new PagingHeaders();
    private routerSubscription: Subscription;

    constructor(
        public route: ActivatedRoute,
        private router: Router,
        private errorService: ErrorService,
        private organisationService: OrganisationService
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

    runSearch(pageIndex = 0): Subject<OrganisationSearchResponse> {

        this.searchOptions.pageIndex = pageIndex;

        const subject = new Subject<OrganisationSearchResponse>();

        this.organisationService.search(this.searchOptions)
            .subscribe({
                next: response => {
                    subject.next(response);
                    this.organisations = response.organisations;
                    this.headers = response.headers;
                },
                error: err => {
                    this.errorService.handleError(err, "Organisations", "Load");
                }
            });

        return subject;

    }

    goToOrganisation(organisation: Organisation): void {
        this.router.navigate([organisation.organisationId], { relativeTo: this.route });
    }
}

