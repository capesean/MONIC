import { SearchOptions, PagingHeaders } from './http.model';
import { Component } from './component.model';
import { TheoryOfChange } from './theoryofchange.model';

export class TheoryOfChangeComponent {
    theoryOfChangeId: string;
    componentId: string;
    component: Component;
    theoryOfChange: TheoryOfChange;

    constructor() {
    }
}

export class TheoryOfChangeComponentSearchOptions extends SearchOptions {
    theoryOfChangeId: string;
    componentId: string;
}

export class TheoryOfChangeComponentSearchResponse {
    theoryOfChangeComponents: TheoryOfChangeComponent[] = [];
    headers: PagingHeaders;
}
