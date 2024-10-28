import { Component as NgComponent, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { PagingHeaders } from '../../common/models/http.model';
import { EntityLinkSearchOptions, EntityLinkSearchResponse, EntityLink } from '../../common/models/entitylink.model';
import { FadeThenShrink } from '../../common/animations/fadethenshrink';
import { ErrorService } from '../../common/services/error.service';
import { EntityLinkService } from '../../common/services/entitylink.service';

@NgComponent({
    selector: 'entitylink-list',
    templateUrl: './entitylink.list.component.html',
    animations: [FadeThenShrink]
})
export class EntityLinkListComponent implements OnInit, OnDestroy {

    public entityLinks: EntityLink[] = [];
    public searchOptions = new EntityLinkSearchOptions();
    public showSearchOptions = false;
    public headers = new PagingHeaders();
    private routerSubscription: Subscription;

    constructor(
        public route: ActivatedRoute,
        private router: Router,
        private errorService: ErrorService,
        private entityLinkService: EntityLinkService
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

    runSearch(pageIndex = 0): Subject<EntityLinkSearchResponse> {

        this.searchOptions.pageIndex = pageIndex;

        const subject = new Subject<EntityLinkSearchResponse>();

        this.entityLinkService.search(this.searchOptions)
            .subscribe({
                next: response => {
                    subject.next(response);
                    this.entityLinks = response.entityLinks;
                    this.headers = response.headers;
                },
                error: err => {
                    this.errorService.handleError(err, "Entity Links", "Load");
                }
            });

        return subject;

    }

    goToEntityLink(entityLink: EntityLink): void {
        this.router.navigate([entityLink.childEntityId, entityLink.parentEntityId], { relativeTo: this.route });
    }
}

