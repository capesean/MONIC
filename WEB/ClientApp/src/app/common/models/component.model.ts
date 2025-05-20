import { SearchOptions, PagingHeaders } from './http.model';
import { ComponentTypes } from './enums.model';
import { ComponentIndicator } from './componentindicator.model';
import { Relationship } from './relationship.model';
import { LogFrameRowComponent } from './logframerowcomponent.model';
import { TheoryOfChangeComponent } from './theoryofchangecomponent.model';
import { IHasFields } from './ihasfields.model';
import { ItemField } from './itemfield.model';
import { ItemOption } from './itemoption.model';

export class Component implements IHasFields {
    componentId: string;
    name: string;
    code: string;
    componentType: ComponentTypes;
    description: string;
    backgroundColour: string;
    textColour: string;
    sortOrder: number;

    componentIndicators: ComponentIndicator[];
    relationshipsAsSource: Relationship[];
    logFrameRowComponents: LogFrameRowComponent[];
    relationshipsAsTarget: Relationship[];
    theoryOfChangeComponents: TheoryOfChangeComponent[];
    itemFields: ItemField[] = [];
    itemOptions: ItemOption[] = [];

    constructor() {
        this.componentId = "00000000-0000-0000-0000-000000000000";
        this.componentIndicators = [];
        this.relationshipsAsSource = [];
        this.logFrameRowComponents = [];
        this.relationshipsAsTarget = [];
        this.theoryOfChangeComponents = [];
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
