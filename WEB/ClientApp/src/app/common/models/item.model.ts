import { SearchOptions, PagingHeaders } from './http.model';
import { ItemTypes } from './enums.model';
import { Document } from './document.model';
import { ItemField } from './itemfield.model';
import { ItemOption } from './itemoption.model';

export class Item {
    itemId: string;
    itemType: ItemTypes;

    documents: Document[];
    itemFields: ItemField[];
    itemOptions: ItemOption[];

    constructor() {
        this.itemId = "00000000-0000-0000-0000-000000000000";
        this.documents = [];
        this.itemFields = [];
        this.itemOptions = [];
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
