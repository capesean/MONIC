import { SearchOptions, PagingHeaders } from './http.model';
import { Date } from './date.model';
import { Question } from './question.model';

export class QuestionSummary {
    questionId: string;
    dateId: string;
    summary: string;
    date: Date;
    question: Question;

    constructor() {
    }
}

export class QuestionSummarySearchOptions extends SearchOptions {
    questionId: string;
    dateId: string;
}

export class QuestionSummarySearchResponse {
    questionSummaries: QuestionSummary[] = [];
    headers: PagingHeaders;
}
