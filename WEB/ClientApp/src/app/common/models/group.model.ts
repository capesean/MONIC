import { SearchOptions, PagingHeaders } from './http.model';
import { Field } from './field.model';

export class Group {
    groupId: string;
    name: string;
    sortOrder: number;

    fields: Field[];

    constructor() {
        this.groupId = "00000000-0000-0000-0000-000000000000";
    }
}

export class GroupSearchOptions extends SearchOptions {
    q: string;
}

export class GroupSearchResponse {
    groups: Group[] = [];
    headers: PagingHeaders;
}
