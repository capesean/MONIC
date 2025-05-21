import { SearchOptions, PagingHeaders } from './http.model';
import { Field } from './field.model';
import { Option } from './option.model';
import { Indicator } from './indicator.model';

export class OptionList {
    optionListId: string;
    name: string;

    fields: Field[];
    options: Option[];
    indicators: Indicator[];

    constructor() {
        this.optionListId = "00000000-0000-0000-0000-000000000000";
        this.fields = [];
        this.options = [];
        this.indicators = [];
    }
}

export class OptionListSearchOptions extends SearchOptions {
    q: string;
}

export class OptionListSearchResponse {
    optionLists: OptionList[] = [];
    headers: PagingHeaders;
}
