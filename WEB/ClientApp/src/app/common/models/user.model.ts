import { SearchOptions, PagingHeaders } from './http.model';
import { Entity } from './entity.model';
import { Organisation } from './organisation.model';
import { FolderContent } from './foldercontent.model';
import { DataReview } from './datareview.model';
import { EntityPermission } from './entitypermission.model';
import { Document } from './document.model';
import { Indicator } from './indicator.model';
import { IndicatorPermission } from './indicatorpermission.model';
import { Response } from './response.model';
import { Datum } from './datum.model';

export class User {
    id: string;
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
    disabled: boolean;
    affiliatedEntityId: string;
    organisationId: string;
    lastLoginDate: Date;
    entity: Entity;
    organisation: Organisation;
    roles: string[] = [];

    addedFolderContents: FolderContent[];
    dataReviews: DataReview[];
    entityPermissions: EntityPermission[];
    uploadedDocuments: Document[];
    createdIndicators: Indicator[];
    indicatorPermissions: IndicatorPermission[];
    submittedResponses: Response[];
    lastSavedData: Datum[];

    constructor() {
        this.id = "00000000-0000-0000-0000-000000000000";
    }
}

export class UserSearchOptions extends SearchOptions {
    q: string;
    disabled: boolean;
    affiliatedEntityId: string;
    organisationId: string;
    roleName: string;
}

export class UserSearchResponse {
    users: User[] = [];
    headers: PagingHeaders;
}
