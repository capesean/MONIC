import { SearchOptions, PagingHeaders } from './http.model';
import { Item } from './item.model';
import { Option } from './option.model';

export class ItemOption {
    itemId: string;
    fieldId: string;
    optionId: string;
    item: Item;
    option: Option;

    constructor() {
    }
}

export class ItemOptionSearchOptions extends SearchOptions {
    itemId: string;
    optionId: string;
}

export class ItemOptionSearchResponse {
    itemOptions: ItemOption[] = [];
    headers: PagingHeaders;
}
