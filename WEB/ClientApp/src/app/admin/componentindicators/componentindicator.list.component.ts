import { Component as NgComponent, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { PagingHeaders } from '../../common/models/http.model';
import { ComponentIndicatorSearchOptions, ComponentIndicatorSearchResponse, ComponentIndicator } from '../../common/models/componentindicator.model';
import { ErrorService } from '../../common/services/error.service';
import { ComponentIndicatorService } from '../../common/services/componentindicator.service';

@NgComponent({
    selector: 'componentindicator-list',
    templateUrl: './componentindicator.list.component.html'
})
export class ComponentIndicatorListComponent implements OnInit {

    public componentIndicators: ComponentIndicator[] = [];
    public searchOptions = new ComponentIndicatorSearchOptions();
    public headers = new PagingHeaders();

    constructor(
        public route: ActivatedRoute,
        private router: Router,
        private errorService: ErrorService,
        private componentIndicatorService: ComponentIndicatorService
    ) {
    }

    ngOnInit(): void {
        this.searchOptions.includeParents = true;
        this.runSearch();
    }

    runSearch(pageIndex = 0): Subject<ComponentIndicatorSearchResponse> {

        this.searchOptions.pageIndex = pageIndex;

        const subject = new Subject<ComponentIndicatorSearchResponse>();

        this.componentIndicatorService.search(this.searchOptions)
            .subscribe({
                next: response => {
                    subject.next(response);
                    this.componentIndicators = response.componentIndicators;
                    this.headers = response.headers;
                },
                error: err => {
                    this.errorService.handleError(err, "Component Indicators", "Load");
                }
            });

        return subject;

    }

    goToComponentIndicator(componentIndicator: ComponentIndicator): void {
        this.router.navigate(["/components", componentIndicator.component.componentId, "componentindicators", componentIndicator.indicatorId]);
    }
}

