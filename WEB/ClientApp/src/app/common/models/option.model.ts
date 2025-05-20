import { SearchOptions, PagingHeaders } from './http.model';
import { OptionList } from './optionlist.model';
import { ItemOption } from './itemoption.model';

export class Option {
    optionId: string;
    optionListId: string;
    name: string;
    sortOrder: number;
    optionList: OptionList;

    itemOptions: ItemOption[];

    constructor() {
        this.optionId = "00000000-0000-0000-0000-000000000000";
        this.itemOptions = [];
    }
}

export class OptionSearchOptions extends SearchOptions {
    q: string;
    optionListId: string;
}

export class OptionSearchResponse {
    options: Option[] = [];
    headers: PagingHeaders;
}
