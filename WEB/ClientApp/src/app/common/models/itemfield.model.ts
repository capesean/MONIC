import { SearchOptions, PagingHeaders } from './http.model';
import { Field } from './field.model';
import { Item } from './item.model';

export class ItemField {
    itemId: string;
    fieldId: string;
    value: string;
    field: Field;
    item: Item;

    constructor() {
    }
}

export class ItemFieldSearchOptions extends SearchOptions {
    q: string;
    itemId: string;
    fieldId: string;
}

export class ItemFieldSearchResponse {
    itemFields: ItemField[] = [];
    headers: PagingHeaders;
}
