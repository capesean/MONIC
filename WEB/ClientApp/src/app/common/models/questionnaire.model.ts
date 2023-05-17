import { SearchOptions, PagingHeaders } from './http.model';
import { Date } from './date.model';
import { EntityType } from './entitytype.model';
import { DateTypes } from './enums.model';
import { Response } from './response.model';
import { Section } from './section.model';

export class Questionnaire {
    questionnaireId: string;
    name: string;
    entityTypeId: string;
    dateType: DateTypes;
    creationText: string;
    completionText: string;
    calculateProgress: boolean;
    displayQuestionCode: boolean;
    showSections: boolean;
    publicCode: string;
    allowMultiple: boolean;
    defaultDateId: string;
    useSubmit: boolean;
    submitOnCompletion: boolean;
    date: Date;
    entityType: EntityType;

    responses: Response[];
    sections: Section[];

    constructor() {
        this.questionnaireId = "00000000-0000-0000-0000-000000000000";
        this.calculateProgress = true;
        this.displayQuestionCode = true;
        this.showSections = true;
    }
}

export class QuestionnaireSearchOptions extends SearchOptions {
    q: string;
    entityTypeId: string;
    dateType: DateTypes;
}

export class QuestionnaireSearchResponse {
    questionnaires: Questionnaire[] = [];
    headers: PagingHeaders;
}
