import { SearchOptions, PagingHeaders } from './http.model';
import { TheoryOfChangeComponent } from './theoryofchangecomponent.model';
import { Relationship } from './relationship.model';

export class TheoryOfChange {
    theoryOfChangeId: string;
    name: string;

    theoryOfChangeComponents: TheoryOfChangeComponent[];
    relationships: Relationship[];

    constructor() {
        this.theoryOfChangeId = "00000000-0000-0000-0000-000000000000";
    }
}

export class TheoryOfChangeSearchOptions extends SearchOptions {
    q: string;
}

export class TheoryOfChangeSearchResponse {
    theoriesOfChange: TheoryOfChange[] = [];
    headers: PagingHeaders;
}
