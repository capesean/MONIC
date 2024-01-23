import { SearchOptions, PagingHeaders } from './http.model';
import { Question } from './question.model';
import { Response } from './response.model';
import { AnswerOption } from './answeroption.model';

export class Answer {
    answerId: string;
    responseId: string;
    questionId: string;
    value: string;
    question: Question;
    response: Response;

    answerOptions: AnswerOption[];

    constructor() {
        this.answerId = "00000000-0000-0000-0000-000000000000";
        this.answerOptions = [];
    }
}

export class AnswerSearchOptions extends SearchOptions {
    q: string;
    responseId: string;
    questionId: string;
}

export class AnswerSearchResponse {
    answers: Answer[] = [];
    headers: PagingHeaders;
}
