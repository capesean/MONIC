import { SearchOptions, PagingHeaders } from './http.model';
import { DateTypes } from './enums.model';
import { Questionnaire } from './questionnaire.model';
import { QuestionSummary } from './questionsummary.model';
import { Response } from './response.model';
import { Datum } from './datum.model';

export class Date {
    dateId: string;
    name: string;
    code: string;
    dateType: DateTypes;
    quarterId: string;
    yearId: string;
    openFrom: Date;
    openTo: Date;
    sortOrder: number;
    quarter: Date;
    year: Date;

    datesInQuarter: Date[];
    datesInYear: Date[];
    defaultDateQuestionnaires: Questionnaire[];
    questionSummaries: QuestionSummary[];
    responses: Response[];
    data: Datum[];

    constructor() {
        this.dateId = "00000000-0000-0000-0000-000000000000";
        this.datesInQuarter = [];
        this.datesInYear = [];
        this.defaultDateQuestionnaires = [];
        this.questionSummaries = [];
        this.responses = [];
        this.data = [];
    }
}

export class DateSearchOptions extends SearchOptions {
    q: string;
    dateType: DateTypes;
    quarterId: string;
    yearId: string;
    isOpen: boolean;
    hasOpened: boolean;
}

export class DateSearchResponse {
    dates: Date[] = [];
    headers: PagingHeaders;
}
