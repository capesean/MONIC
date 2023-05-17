import { Component as NgComponent, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { PagingHeaders } from '../../common/models/http.model';
import { RelationshipSearchOptions, RelationshipSearchResponse, Relationship } from '../../common/models/relationship.model';
import { ErrorService } from '../../common/services/error.service';
import { RelationshipService } from '../../common/services/relationship.service';

@NgComponent({
    selector: 'relationship-list',
    templateUrl: './relationship.list.component.html'
})
export class RelationshipListComponent implements OnInit {

    public relationships: Relationship[] = [];
    public searchOptions = new RelationshipSearchOptions();
    public headers = new PagingHeaders();

    constructor(
        public route: ActivatedRoute,
        private router: Router,
        private errorService: ErrorService,
        private relationshipService: RelationshipService
    ) {
    }

    ngOnInit(): void {
        this.searchOptions.includeParents = true;
        this.runSearch();
    }

    runSearch(pageIndex = 0): Subject<RelationshipSearchResponse> {

        this.searchOptions.pageIndex = pageIndex;

        const subject = new Subject<RelationshipSearchResponse>();

        this.relationshipService.search(this.searchOptions)
            .subscribe({
                next: response => {
                    subject.next(response);
                    this.relationships = response.relationships;
                    this.headers = response.headers;
                },
                error: err => {
                    this.errorService.handleError(err, "Relationships", "Load");
                }
            });

        return subject;

    }

    goToRelationship(relationship: Relationship): void {
        this.router.navigate(["/theoriesofchange", relationship.theoryOfChange.theoryOfChangeId, "relationships", relationship.relationshipId]);
    }
}

