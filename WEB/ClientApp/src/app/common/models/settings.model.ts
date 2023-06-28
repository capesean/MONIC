import { SearchOptions, PagingHeaders } from './http.model';

export class Settings {
    id: string;
    useSubmit: boolean;
    useVerify: boolean;
    useApprove: boolean;
    useReject: boolean;
    chatGPTAPIKey: string;

    constructor() {
        this.id = "00000000-0000-0000-0000-000000000000";
    }
}

export class SettingsSearchOptions extends SearchOptions {
    q: string;
}

export class SettingsSearchResponse {
    settings: Settings[] = [];
    headers: PagingHeaders;
}
