import { SearchOptions, PagingHeaders } from './http.model';
import { ComponentTypes } from './enums.model';
import { Relationship } from './relationship.model';
import { LogFrameRowComponent } from './logframerowcomponent.model';
import { TheoryOfChangeComponent } from './theoryofchangecomponent.model';
import { IHasFields } from './ihasfields.model';
import { FieldValue } from './fieldvalue.model';
import { OptionValue } from './optionvalue.model';

export class Component implements IHasFields {
    componentId: string;
    name: string;
    code: string;
    componentType: ComponentTypes;
    description: string;
    backgroundColour: string;
    textColour: string;
    sortOrder: number;

    relationshipsAsSource: Relationship[];
    logFrameRowComponents: LogFrameRowComponent[];
    relationshipsAsTarget: Relationship[];
    theoryOfChangeComponents: TheoryOfChangeComponent[];
    fieldValues: FieldValue[] = [];
    optionValues: OptionValue[] = [];

    constructor() {
        this.componentId = "00000000-0000-0000-0000-000000000000";
    }
}

export class ComponentSearchOptions extends SearchOptions {
    q: string;
    componentType: ComponentTypes;
}

export class ComponentSearchResponse {
    components: Component[] = [];
    headers: PagingHeaders;
}
