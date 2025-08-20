import { SearchOptions, PagingHeaders } from './http.model';
import { Group } from './group.model';
import { OptionList } from './optionlist.model';
import { FieldTypes, Sizes } from './enums.model';
import { ItemField } from './itemfield.model';

export class Field {
    fieldId: string;
    name: string;
    fieldType: FieldTypes;
    optionListId: string;
    organisation: boolean;
    entity: boolean;
    indicator: boolean;
    component: boolean;
    relationship: boolean;
    folder: boolean;
    category: boolean;
    required: boolean;
    isUnique: boolean;
    size: Sizes;
    minLength: number;
    maxLength: number;
    regEx: string;
    sortOrder: number;
    multiple: boolean;
    radioCheckbox: boolean;
    multiLine: boolean;
    groupId: string;
    rows: number;
    group: Group;
    optionList: OptionList;

    itemFields: ItemField[];

    constructor() {
        this.fieldId = "00000000-0000-0000-0000-000000000000";
        this.size = 1;
        this.rows = 5;
        this.itemFields = [];
    }
}

export class FieldSearchOptions extends SearchOptions {
    q: string;
    fieldType: FieldTypes;
    organisation: boolean;
    entity: boolean;
    indicator: boolean;
    groupId: string;
}

export class FieldSearchResponse {
    fields: Field[] = [];
    headers: PagingHeaders;
}
