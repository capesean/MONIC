import { SearchOptions, PagingHeaders } from './http.model';
import { Answer } from './answer.model';
import { QuestionOption } from './questionoption.model';

export class AnswerOption {
    answerId: string;
    questionOptionId: string;
    answer: Answer;
    questionOption: QuestionOption;

    constructor() {
    }
}

export class AnswerOptionSearchOptions extends SearchOptions {
    answerId: string;
    questionOptionId: string;
}

export class AnswerOptionSearchResponse {
    answerOptions: AnswerOption[] = [];
    headers: PagingHeaders;
}
