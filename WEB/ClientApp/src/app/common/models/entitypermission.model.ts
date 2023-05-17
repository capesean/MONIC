import { SearchOptions, PagingHeaders } from './http.model';
import { Entity } from './entity.model';
import { User } from './user.model';

export class EntityPermission {
    entityPermissionId: string;
    userId: string;
    entityId: string;
    entity: Entity;
    user: User;

    constructor() {
        this.entityPermissionId = "00000000-0000-0000-0000-000000000000";
    }
}

export class EntityPermissionSearchOptions extends SearchOptions {
    userId: string;
    entityId: string;
}

export class EntityPermissionSearchResponse {
    entityPermissions: EntityPermission[] = [];
    headers: PagingHeaders;
}
