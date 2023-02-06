import { SearchOptions, PagingHeaders } from './http.model';
import { UserTest } from './usertest.model';

export class User {
    id: string;
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
    disabled: boolean;
    roles: string[] = [];

    userTests: UserTest[];

    constructor() {
        this.id = "00000000-0000-0000-0000-000000000000";
    }
}

export class UserSearchOptions extends SearchOptions {
    q: string;
    disabled: boolean;
    roleName: string;
}

export class UserSearchResponse {
    users: User[] = [];
    headers: PagingHeaders;
}
