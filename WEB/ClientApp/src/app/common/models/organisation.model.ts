import { SearchOptions, PagingHeaders } from './http.model';
import { Entity } from './entity.model';
import { User } from './user.model';
import { IHasFields } from './ihasfields.model';
import { OptionValue } from './optionvalue.model';
import { FieldValue } from './fieldvalue.model';

export class Organisation implements IHasFields {
    organisationId: string;
    name: string;
    code: string;

    entities: Entity[];
    users: User[];
    fieldValues: FieldValue[] = [];
    optionValues: OptionValue[] = [];

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
