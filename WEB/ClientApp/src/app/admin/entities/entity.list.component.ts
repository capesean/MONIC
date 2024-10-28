import { Component as NgComponent, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { PagingHeaders } from '../../common/models/http.model';
import { EntitySearchOptions, EntitySearchResponse, Entity } from '../../common/models/entity.model';
import { FadeThenShrink } from '../../common/animations/fadethenshrink';
import { ErrorService } from '../../common/services/error.service';
import { EntityService } from '../../common/services/entity.service';
import { Roles } from '../../common/models/enums.model';

@NgComponent({
    selector: 'entity-list',
    templateUrl: './entity.list.component.html',
    animations: [FadeThenShrink]
})
export class EntityListComponent implements OnInit, OnDestroy {

    public entities: Entity[] = [];
    public searchOptions = new EntitySearchOptions();
    public showSearchOptions = false;
    public headers = new PagingHeaders();
    private routerSubscription: Subscription;

    constructor(
        public route: ActivatedRoute,
        private router: Router,
        private errorService: ErrorService,
        private entityService: EntityService
    ) {
    }

    ngOnInit(): void {
        this.searchOptions.includeParents = true;
        this.searchOptions.role = Roles.Administrator;
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

    runSearch(pageIndex = 0): Subject<EntitySearchResponse> {

        this.searchOptions.pageIndex = pageIndex;

        const subject = new Subject<EntitySearchResponse>();

        this.entityService.search(this.searchOptions)
            .subscribe({
                next: response => {
                    subject.next(response);
                    this.entities = response.entities;
                    this.headers = response.headers;
                },
                error: err => {
                    this.errorService.handleError(err, "Entities", "Load");
                }
            });

        return subject;

    }

    goToEntity(entity: Entity): void {
        this.router.navigate([entity.entityId], { relativeTo: this.route });
    }
}

