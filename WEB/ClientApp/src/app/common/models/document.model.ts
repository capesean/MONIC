import { SearchOptions, PagingHeaders } from './http.model';
import { Item } from './item.model';
import { User } from './user.model';

export class Document {
    documentId: string;
    itemId: string;
    fileName: string;
    fileContents: string;
    notes: string;
    uploadedOn: Date;
    uploadedById: string;
    size: number;
    item: Item;
    uploadedBy: User;

    constructor() {
        this.documentId = "00000000-0000-0000-0000-000000000000";
    }
}

export class DocumentSearchOptions extends SearchOptions {
    q: string;
    itemId: string;
}

export class DocumentSearchResponse {
    documents: Document[] = [];
    headers: PagingHeaders;
}
