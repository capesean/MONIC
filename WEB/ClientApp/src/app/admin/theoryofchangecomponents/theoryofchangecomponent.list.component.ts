import { Component as NgComponent, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { PagingHeaders } from '../../common/models/http.model';
import { TheoryOfChangeComponentSearchOptions, TheoryOfChangeComponentSearchResponse, TheoryOfChangeComponent } from '../../common/models/theoryofchangecomponent.model';
import { ErrorService } from '../../common/services/error.service';
import { TheoryOfChangeComponentService } from '../../common/services/theoryofchangecomponent.service';

@NgComponent({
    selector: 'theoryofchangecomponent-list',
    templateUrl: './theoryofchangecomponent.list.component.html'
})
export class TheoryOfChangeComponentListComponent implements OnInit {

    public theoryOfChangeComponents: TheoryOfChangeComponent[] = [];
    public searchOptions = new TheoryOfChangeComponentSearchOptions();
    public headers = new PagingHeaders();

    constructor(
        public route: ActivatedRoute,
        private router: Router,
        private errorService: ErrorService,
        private theoryOfChangeComponentService: TheoryOfChangeComponentService
    ) {
    }

    ngOnInit(): void {
        this.searchOptions.includeParents = true;
        this.runSearch();
    }

    runSearch(pageIndex = 0): Subject<TheoryOfChangeComponentSearchResponse> {

        this.searchOptions.pageIndex = pageIndex;

        const subject = new Subject<TheoryOfChangeComponentSearchResponse>();

        this.theoryOfChangeComponentService.search(this.searchOptions)
            .subscribe({
                next: response => {
                    subject.next(response);
                    this.theoryOfChangeComponents = response.theoryOfChangeComponents;
                    this.headers = response.headers;
                },
                error: err => {
                    this.errorService.handleError(err, "Theory of Change Components", "Load");
                }
            });

        return subject;

    }

    goToTheoryOfChangeComponent(theoryOfChangeComponent: TheoryOfChangeComponent): void {
        this.router.navigate(["/theoriesofchange", theoryOfChangeComponent.theoryOfChange.theoryOfChangeId, "theoryofchangecomponents", theoryOfChangeComponent.componentId]);
    }
}

