import { SearchOptions, PagingHeaders } from './http.model';
import { QuestionOptionGroup } from './questionoptiongroup.model';
import { Section } from './section.model';
import { OptionListTypes, QuestionTypes, SkipLogicActions } from './enums.model';
import { Answer } from './answer.model';
import { QuestionSummary } from './questionsummary.model';
import { SkipLogicOption } from './skiplogicoption.model';

export class Question {
    questionId: string;
    sectionId: string;
    code: string;
    text: string;
    questionType: QuestionTypes;
    optionListType: OptionListTypes;
    explanation: string;
    required: boolean;
    questionOptionGroupId: string;
    minimumDocuments: number;
    maximumDocuments: number;
    checkQuestionId: string;
    skipLogicAction: SkipLogicActions;
    sortOrder: number;
    checkQuestion: Question;
    questionOptionGroup: QuestionOptionGroup;
    section: Section;

    answers: Answer[];
    questionSummaries: QuestionSummary[];
    skipLogicOptions: SkipLogicOption[];
    skipLogicQuestions: Question[];

    constructor() {
        this.questionId = "00000000-0000-0000-0000-000000000000";
        this.required = true;
        this.answers = [];
        this.questionSummaries = [];
        this.skipLogicOptions = [];
        this.skipLogicQuestions = [];
        this.skipLogicAction = SkipLogicActions.Show;
    }
}

export class QuestionSearchOptions extends SearchOptions {
    q: string;
    questionnaireId: string;
    sectionId: string;
    questionType: QuestionTypes;
    questionOptionGroupId: string;
}

export class QuestionSearchResponse {
    questions: Question[] = [];
    headers: PagingHeaders;
}
