import { SearchOptions, PagingHeaders } from './http.model';
import { Component } from './component.model';
import { TheoryOfChange } from './theoryofchange.model';
import { ItemField } from './itemfield.model';
import { IHasFields } from './ihasfields.model';
import { ItemOption } from './itemoption.model';

export class Relationship implements IHasFields {
    relationshipId: string;
    theoryOfChangeId: string;
    sourceComponentId: string;
    targetComponentId: string;
    label: string;
    sourceComponent: Component;
    targetComponent: Component;
    theoryOfChange: TheoryOfChange;
    itemFields: ItemField[] = [];
    itemOptions: ItemOption[] = [];

    constructor() {
        this.relationshipId = "00000000-0000-0000-0000-000000000000";
    }
}

export class RelationshipSearchOptions extends SearchOptions {
    theoryOfChangeId: string;
    sourceComponentId: string;
    targetComponentId: string;
}

export class RelationshipSearchResponse {
    relationships: Relationship[] = [];
    headers: PagingHeaders;
}
