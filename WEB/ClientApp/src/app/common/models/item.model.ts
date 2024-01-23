import { SearchOptions, PagingHeaders } from './http.model';
import { ItemTypes } from './enums.model';
import { Document } from './document.model';
import { FieldValue } from './fieldvalue.model';
import { OptionValue } from './optionvalue.model';

export class Item {
    itemId: string;
    itemType: ItemTypes;

    documents: Document[];
    fieldValues: FieldValue[];
    optionValues: OptionValue[];

    constructor() {
        this.itemId = "00000000-0000-0000-0000-000000000000";
        this.documents = [];
        this.fieldValues = [];
        this.optionValues = [];
    }
}

export class ItemSearchOptions extends SearchOptions {
    q: string;
    itemType: ItemTypes;
}

export class ItemSearchResponse {
    items: Item[] = [];
    headers: PagingHeaders;
}
