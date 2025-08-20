import { SearchOptions, PagingHeaders } from './http.model';
import { Category } from './category.model';
import { Indicator } from './indicator.model';
import { IHasFields } from './ihasfields.model';
import { ItemField } from './itemfield.model';
import { ItemOption } from './itemoption.model';

export class Subcategory implements IHasFields {
    subcategoryId: string;
    categoryId: string;
    name: string;
    code: string;
    dataEntrySubtotal: boolean;
    sortOrder: number;
    category: Category;

    indicators: Indicator[];
    itemFields: ItemField[] = [];
    itemOptions: ItemOption[] = [];

    constructor() {
        this.subcategoryId = "00000000-0000-0000-0000-000000000000";
        this.indicators = [];
    }
}

export class SubcategorySearchOptions extends SearchOptions {
    q: string;
    categoryId: string;
}

export class SubcategorySearchResponse {
    subcategories: Subcategory[] = [];
    headers: PagingHeaders;
}
