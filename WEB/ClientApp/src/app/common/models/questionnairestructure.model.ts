import { Question } from './question.model';
import { Questionnaire } from './questionnaire.model';
import { QuestionOptionGroup } from './questionoptiongroup.model';
import { Section } from './section.model';
import { SkipLogicOption } from './skiplogicoption.model';

export class QuestionnaireStructure {

    questionnaire: Questionnaire;
    sections: Section[];
    questions: Question[];
    questionOptionGroups: QuestionOptionGroup[];
    skipLogicOptions: SkipLogicOption[];

    constructor() {
    }
}
