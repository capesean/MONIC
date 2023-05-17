import { SearchOptions, PagingHeaders } from './http.model';
import { Question } from './question.model';
import { QuestionOption } from './questionoption.model';

export class SkipLogicOption {
    questionId: string;
    checkQuestionOptionId: string;
    question: Question;
    questionOption: QuestionOption;

    constructor() {
    }
}

export class SkipLogicOptionSearchOptions extends SearchOptions {
    questionId: string;
    checkQuestionOptionId: string;
}

export class SkipLogicOptionSearchResponse {
    skipLogicOptions: SkipLogicOption[] = [];
    headers: PagingHeaders;
}
