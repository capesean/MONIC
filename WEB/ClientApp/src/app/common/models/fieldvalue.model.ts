import { SearchOptions, PagingHeaders } from './http.model';
import { Field } from './field.model';
import { Item } from './item.model';

export class FieldValue {
    itemId: string;
    fieldId: string;
    value: string;
    field: Field;
    item: Item;

    constructor() {
    }
}

export class FieldValueSearchOptions extends SearchOptions {
    q: string;
    itemId: string;
    fieldId: string;
}

export class FieldValueSearchResponse {
    fieldValues: FieldValue[] = [];
    headers: PagingHeaders;
}
