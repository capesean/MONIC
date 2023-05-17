import { SearchOptions, PagingHeaders } from './http.model';
import { Questionnaire } from './questionnaire.model';
import { Question } from './question.model';

export class Section {
    sectionId: string;
    questionnaireId: string;
    name: string;
    canNavigate: boolean;
    sortOrder: number;
    questionnaire: Questionnaire;

    questions: Question[];

    constructor() {
        this.sectionId = "00000000-0000-0000-0000-000000000000";
    }
}

export class SectionSearchOptions extends SearchOptions {
    q: string;
    questionnaireId: string;
}

export class SectionSearchResponse {
    sections: Section[] = [];
    headers: PagingHeaders;
}
