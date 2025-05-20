import { SearchOptions, PagingHeaders } from './http.model';
import { Group } from './group.model';
import { FieldTypes, Sizes } from './enums.model';
import { FieldValue } from './fieldvalue.model';
import { Option } from './option.model';

export class Field {
    fieldId: string;
    name: string;
    fieldType: FieldTypes;
    organisation: boolean;
    entity: boolean;
    indicator: boolean;
    component: boolean;
    relationship: boolean;
    folder: boolean;
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

    fieldValues: FieldValue[];
    options: Option[];

    constructor() {
        this.fieldId = "00000000-0000-0000-0000-000000000000";
        this.size = 1;
        this.rows = 5;
        this.fieldValues = [];
        this.options = [];
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
