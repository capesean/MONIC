import { Component as NgComponent, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PagingHeaders } from '../../common/models/http.model';
import { EntityTypeSearchOptions, EntityTypeSearchResponse, EntityType } from '../../common/models/entitytype.model';
import { FadeThenShrink } from '../../common/animations/fadethenshrink';
import { ErrorService } from '../../common/services/error.service';
import { EntityTypeService } from '../../common/services/entitytype.service';
import { EntityTypeSortComponent } from './entitytype.sort.component';

@NgComponent({
    selector: 'entitytype-list',
    templateUrl: './entitytype.list.component.html',
    animations: [FadeThenShrink]
})
export class EntityTypeListComponent implements OnInit, OnDestroy {

    public entityTypes: EntityType[] = [];
    public searchOptions = new EntityTypeSearchOptions();
    public showSearchOptions = false;
    public headers = new PagingHeaders();
    private routerSubscription: Subscription;

    constructor(
        public route: ActivatedRoute,
        private router: Router,
        private errorService: ErrorService,
        private modalService: NgbModal,
        private entityTypeService: EntityTypeService
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

    runSearch(pageIndex = 0): Subject<EntityTypeSearchResponse> {

        this.searchOptions.pageIndex = pageIndex;

        const subject = new Subject<EntityTypeSearchResponse>();

        this.entityTypeService.search(this.searchOptions)
            .subscribe({
                next: response => {
                    subject.next(response);
                    this.entityTypes = response.entityTypes;
                    this.headers = response.headers;
                },
                error: err => {
                    this.errorService.handleError(err, "Entity Types", "Load");
                }
            });

        return subject;

    }

    showSort(): void {
        let modalRef = this.modalService.open(EntityTypeSortComponent, { size: 'xl', centered: true, scrollable: false });
        modalRef.result.then(
            () => {

                this.searchOptions.orderBy = null;
                this.runSearch(this.headers.pageIndex);

            }, () => { });
    }

    goToEntityType(entityType: EntityType): void {
        this.router.navigate([entityType.entityTypeId], { relativeTo: this.route });
    }
}

