import { SearchOptions, PagingHeaders } from './http.model';
import { AppDate as MonicDate } from './date.model';
import { Entity } from './entity.model';
import { Questionnaire } from './questionnaire.model';
import { User } from './user.model';
import { Answer } from './answer.model';

export class Response {
    responseId: string;
    questionnaireId: string;
    entityId: string;
    dateId: string;
    publicCode: string;
    openFrom: Date;
    openTo: Date;
    totalQuestions: number;
    applicableQuestions: number;
    completedQuestions: number;
    createdOnUtc: Date;
    lastAnsweredOnUtc: Date;
    submittedOnUtc: Date;
    submittedById: string;
    submitted: boolean;
    date: MonicDate;
    entity: Entity;
    questionnaire: Questionnaire;
    submittedBy: User;

    answers: Answer[];

    constructor() {
        this.responseId = "00000000-0000-0000-0000-000000000000";
        this.answers = [];
    }
}

export class ResponseSearchOptions extends SearchOptions {
    questionnaireId: string;
    entityId: string;
    dateId: string;
}

export class ResponseSearchResponse {
    responses: Response[] = [];
    headers: PagingHeaders;
}
