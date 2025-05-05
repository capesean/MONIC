import { Pipe, PipeTransform } from '@angular/core';
import { Questionnaire } from '../models/questionnaire.model';
import { QuestionLink } from '../models/survey.model';

@Pipe({
    name: 'paragraphsPipe',
    standalone: false
})
export class ParagraphsPipe implements PipeTransform {
    transform(questionLink: QuestionLink, questionnaire: Questionnaire): string {
        const paragraphs = questionLink.question.text.split("\n");
        // todo: sanitizer is stripping the ngbTooltip:
        // ngbTooltip="This is a required question"
        if (questionLink.question.required) paragraphs[paragraphs.length - 1] = paragraphs[paragraphs.length - 1] + `<span class="required cursor-help" title="This is a required question">*</span>`;
        if (questionnaire.displayQuestionCode) paragraphs[0] = "<span class='questionCode'>" + questionLink.question.code +":</span> " + paragraphs[0];
        return `<p>${paragraphs.join("</p><p>")}</p>`;
    }
}
