import { SearchOptions, PagingHeaders } from './http.model';
import { QuestionOption } from './questionoption.model';
import { Question } from './question.model';

export class QuestionOptionGroup {
    questionOptionGroupId: string;
    name: string;
    shared: boolean;

    questionOptions: QuestionOption[];
    questions: Question[];

    constructor() {
        this.questionOptionGroupId = "00000000-0000-0000-0000-000000000000";
        this.questionOptions = [];
        this.questions = [];
    }
}

export class QuestionOptionGroupSearchOptions extends SearchOptions {
    q: string;
    shared: boolean;
}

export class QuestionOptionGroupSearchResponse {
    questionOptionGroups: QuestionOptionGroup[] = [];
    headers: PagingHeaders;
}
