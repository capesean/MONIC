import { Component as NgComponent, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PagingHeaders } from '../../common/models/http.model';
import { ComponentSearchOptions, ComponentSearchResponse, Component } from '../../common/models/component.model';
import { Enum, Enums } from '../../common/models/enums.model';
import { ErrorService } from '../../common/services/error.service';
import { ComponentService } from '../../common/services/component.service';
import { ComponentSortComponent } from './component.sort.component';

@NgComponent({
    selector: 'component-list',
    templateUrl: './component.list.component.html'
})
export class ComponentListComponent implements OnInit, OnDestroy {

    public components: Component[] = [];
    public searchOptions = new ComponentSearchOptions();
    public headers = new PagingHeaders();
    private routerSubscription: Subscription;
    public componentTypes: Enum[] = Enums.ComponentTypes;

    constructor(
        public route: ActivatedRoute,
        private router: Router,
        private errorService: ErrorService,
        private modalService: NgbModal,
        private componentService: ComponentService
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

    runSearch(pageIndex = 0): Subject<ComponentSearchResponse> {

        this.searchOptions.pageIndex = pageIndex;

        const subject = new Subject<ComponentSearchResponse>();

        this.componentService.search(this.searchOptions)
            .subscribe({
                next: response => {
                    subject.next(response);
                    this.components = response.components;
                    this.headers = response.headers;
                },
                error: err => {
                    this.errorService.handleError(err, "Components", "Load");
                }
            });

        return subject;

    }

    showSort(): void {
        let modalRef = this.modalService.open(ComponentSortComponent, { size: 'xl', centered: true, scrollable: true });
        modalRef.result.then(
            () => {

                this.searchOptions.orderBy = null;
                this.runSearch(this.headers.pageIndex);

            }, () => { });
    }

    goToComponent(component: Component): void {
        this.router.navigate([component.componentId], { relativeTo: this.route });
    }
}

