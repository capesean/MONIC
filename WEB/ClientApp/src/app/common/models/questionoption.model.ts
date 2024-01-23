import { SearchOptions, PagingHeaders } from './http.model';
import { QuestionOptionGroup } from './questionoptiongroup.model';
import { SkipLogicOption } from './skiplogicoption.model';
import { AnswerOption } from './answeroption.model';

export class QuestionOption {
    questionOptionId: string;
    questionOptionGroupId: string;
    label: string;
    value: number;
    color: string;
    sortOrder: number;
    questionOptionGroup: QuestionOptionGroup;

    skipLogicOptions: SkipLogicOption[];
    answerOptions: AnswerOption[];

    constructor() {
        this.questionOptionId = "00000000-0000-0000-0000-000000000000";
        this.skipLogicOptions = [];
        this.answerOptions = [];
    }
}

export class QuestionOptionSearchOptions extends SearchOptions {
    q: string;
    questionOptionGroupId: string;
}

export class QuestionOptionSearchResponse {
    questionOptions: QuestionOption[] = [];
    headers: PagingHeaders;
}
