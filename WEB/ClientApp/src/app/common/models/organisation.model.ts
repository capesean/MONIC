import { SearchOptions, PagingHeaders } from './http.model';
import { Entity } from './entity.model';
import { User } from './user.model';
import { IHasFields } from './ihasfields.model';
import { FieldValue } from './fieldvalue.model';
import { ItemOption } from './itemoption.model';

export class Organisation implements IHasFields {
    organisationId: string;
    name: string;
    code: string;

    entities: Entity[];
    users: User[];
    fieldValues: FieldValue[] = [];
    itemOptions: ItemOption[] = [];

    constructor() {
        this.organisationId = "00000000-0000-0000-0000-000000000000";
        this.entities = [];
        this.users = [];
    }
}

export class OrganisationSearchOptions extends SearchOptions {
    q: string;
}

export class OrganisationSearchResponse {
    organisations: Organisation[] = [];
    headers: PagingHeaders;
}
