import { SearchOptions, PagingHeaders } from './http.model';
import { Entity } from './entity.model';
import { Questionnaire } from './questionnaire.model';
import { Indicator } from './indicator.model';

export class EntityType {
    entityTypeId: string;
    name: string;
    plural: string;
    sortOrder: number;

    entities: Entity[];
    questionnaires: Questionnaire[];
    indicators: Indicator[];

    constructor() {
        this.entityTypeId = "00000000-0000-0000-0000-000000000000";
    }
}

export class EntityTypeSearchOptions extends SearchOptions {
    q: string;
}

export class EntityTypeSearchResponse {
    entityTypes: EntityType[] = [];
    headers: PagingHeaders;
}
