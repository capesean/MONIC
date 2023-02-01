import { SearchOptions, PagingHeaders } from './http.model';
import { User } from './user.model';

export class UserTest {
    userTestId: string;
    userId: string;
    name: string;
    user: User;

    constructor() {
        this.userTestId = "00000000-0000-0000-0000-000000000000";
    }
}

export class UserTestSearchOptions extends SearchOptions {
    q: string;
    userId: string;
}

export class UserTestSearchResponse {
    userTests: UserTest[] = [];
    headers: PagingHeaders;
}
