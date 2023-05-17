import { SearchOptions, PagingHeaders } from './http.model';
import { Indicator } from './indicator.model';
import { User } from './user.model';

export class IndicatorPermission {
    indicatorPermissionId: string;
    userId: string;
    indicatorId: string;
    edit: boolean;
    submit: boolean;
    verify: boolean;
    approve: boolean;
    indicator: Indicator;
    user: User;

    constructor() {
        this.indicatorPermissionId = "00000000-0000-0000-0000-000000000000";
    }
}

export class IndicatorPermissionSearchOptions extends SearchOptions {
    userId: string;
    indicatorId: string;
    verify: boolean;
}

export class IndicatorPermissionSearchResponse {
    indicatorPermissions: IndicatorPermission[] = [];
    headers: PagingHeaders;
}

export class AssignPermissionModel {
    userId: string;
    indicatorId: string;
    view: boolean;
    edit: boolean;
    submit: boolean;
    approve: boolean;
}