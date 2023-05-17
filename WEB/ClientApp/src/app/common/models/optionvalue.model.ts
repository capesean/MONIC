import { SearchOptions, PagingHeaders } from './http.model';
import { Item } from './item.model';
import { Option } from './option.model';

export class OptionValue {
    itemId: string;
    optionId: string;
    item: Item;
    option: Option;

    constructor() {
    }
}

export class OptionValueSearchOptions extends SearchOptions {
    itemId: string;
    optionId: string;
}

export class OptionValueSearchResponse {
    optionValues: OptionValue[] = [];
    headers: PagingHeaders;
}
