import { Answer } from "./answer.model";
import { Date } from "./date.model";
import { Document } from "./document.model";
import { Entity } from "./entity.model";
import { SkipLogicActions } from "./enums.model";
import { Question } from "./question.model";
import { Questionnaire } from "./questionnaire.model";
import { QuestionOption } from "./questionoption.model";
import { Section } from "./section.model";

export class Logic {
    public checkQuestionId: string;
    public checkQuestion: Question;
    public checkOptions: QuestionOption[] = [];
    public skipLogicAction: SkipLogicActions = SkipLogicActions.Show;
}

export class LocalSection extends Section {
    canAccess: boolean;
}

export class QuestionLink {
    isFirst: boolean;
    previous: QuestionLink;
    question: Question;
    answer: AnswerItem;
    next: QuestionLink;
    isLast: boolean;
}

export class AnswerItem extends Answer {
    documents: Document[] = [];
}

export class SurveyParams {
    public responseId: string;
    public publicCode: string;
}

export class SurveyProgress {
    totalQuestions: number;
    applicableQuestions: number;
    completedQuestions: number;
    entity: Entity;
}

export class StartQuestionnaire {
    questionnaire: Questionnaire;
    entities: Entity[];
    dates: Date[];
}
