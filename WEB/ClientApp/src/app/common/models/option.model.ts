import { SearchOptions, PagingHeaders } from './http.model';
import { Field } from './field.model';
import { ItemOption } from './itemoption.model';

export class Option {
    optionId: string;
    fieldId: string;
    name: string;
    sortOrder: number;
    field: Field;

    itemOptions: ItemOption[];

    constructor() {
        this.optionId = "00000000-0000-0000-0000-000000000000";
        this.itemOptions = [];
    }
}

export class OptionSearchOptions extends SearchOptions {
    q: string;
    fieldId: string;
}

export class OptionSearchResponse {
    options: Option[] = [];
    headers: PagingHeaders;
}
