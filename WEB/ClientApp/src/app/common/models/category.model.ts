import { SearchOptions, PagingHeaders } from './http.model';
import { IHasFields } from './ihasfields.model';
import { ItemField } from './itemfield.model';
import { ItemOption } from './itemoption.model';
import { Subcategory } from './subcategory.model';

export class Category implements IHasFields {
    categoryId: string;
    name: string;
    code: string;
    sortOrder: number;

    subcategories: Subcategory[];
    itemFields: ItemField[] = [];
    itemOptions: ItemOption[] = [];

    constructor() {
        this.categoryId = "00000000-0000-0000-0000-000000000000";
        this.subcategories = [];
    }
}

export class CategorySearchOptions extends SearchOptions {
    q: string;
}

export class CategorySearchResponse {
    categories: Category[] = [];
    headers: PagingHeaders;
}
