import { SearchOptions, PagingHeaders } from './http.model';
import { Field } from './field.model';
import { OptionValue } from './optionvalue.model';

export class Option {
    optionId: string;
    fieldId: string;
    name: string;
    sortOrder: number;
    field: Field;

    optionValues: OptionValue[];

    constructor() {
        this.optionId = "00000000-0000-0000-0000-000000000000";
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
