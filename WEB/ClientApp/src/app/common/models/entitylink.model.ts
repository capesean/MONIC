import { SearchOptions, PagingHeaders } from './http.model';
import { Entity } from './entity.model';

export class EntityLink {
    childEntityId: string;
    parentEntityId: string;
    childEntity: Entity;
    parentEntity: Entity;

    constructor() {
    }
}

export class EntityLinkSearchOptions extends SearchOptions {
    childEntityId: string;
    parentEntityId: string;
}

export class EntityLinkSearchResponse {
    entityLinks: EntityLink[] = [];
    headers: PagingHeaders;
}
