import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { SearchQuery } from '../models/http.model';
import { QuestionnaireStructure } from '../models/questionnairestructure.model';
import { AnswerItem, SurveyProgress, SurveyParams, StartQuestionnaire, Logic } from '../models/survey.model';
import { HttpParams } from '@angular/common/http';
import { Response } from '../models/response.model';
import { DownloadService } from './download.service';

@Injectable({ providedIn: 'root' })
export class SurveyService extends SearchQuery {

    constructor(private http: HttpClient, private downloadService: DownloadService) {
        super();
    }

    getQuestionnaire(publicCode: string): Observable<StartQuestionnaire> {
        return this.http.get<StartQuestionnaire>(`${environment.baseApiUrl}surveys/questionnaires/${publicCode}`);
    }

    startQuestionnaire(publicCode: string, entityId: string, dateId: string): Observable<Response> {
        return this.http.post<Response>(`${environment.baseApiUrl}surveys/questionnaires/${publicCode}`, { entityId, dateId });
    }

    getResponse(surveyParams: SurveyParams): Observable<Response> {
        const queryParams: HttpParams = this.buildQueryParams({ responseId: surveyParams.responseId, publicCode: surveyParams.publicCode });
        return this.http.get<Response>(`${environment.baseApiUrl}surveys/responses`, { params: queryParams });
    }

    loadStructure(surveyParams: SurveyParams): Observable<QuestionnaireStructure> {
        const queryParams: HttpParams = this.buildQueryParams({ responseId: surveyParams.responseId, publicCode: surveyParams.publicCode });
        return this.http.get<QuestionnaireStructure>(`${environment.baseApiUrl}surveys/structure`, { params: queryParams });
    }

    getAnswer(surveyParams: SurveyParams, questionId: string): Observable<AnswerItem> {
        const queryParams: HttpParams = this.buildQueryParams({ responseId: surveyParams.responseId, publicCode: surveyParams.publicCode });
        return this.http.get<AnswerItem>(`${environment.baseApiUrl}surveys/questions/${questionId}/answer`, { params: queryParams });
    }

    getLogic(surveyParams: SurveyParams, questionId: string): Observable<Logic> {
        const queryParams: HttpParams = this.buildQueryParams({ responseId: surveyParams.responseId, publicCode: surveyParams.publicCode });
        return this.http.get<Logic>(`${environment.baseApiUrl}surveys/questions/${questionId}/logic`, { params: queryParams });
    }

    saveAnswer(surveyParams: SurveyParams, answer: AnswerItem): Observable<SurveyProgress> {
        const queryParams: HttpParams = this.buildQueryParams({ responseId: surveyParams.responseId, publicCode: surveyParams.publicCode });
        return this.http.post<SurveyProgress>(`${environment.baseApiUrl}surveys/questions/${answer.questionId}/answer`, answer, { params: queryParams });
    }

    submit(responseId: string): Observable<Response> {
        return this.http.post<Response>(`${environment.baseApiUrl}surveys/responses/${responseId}/submit`, {});
    }

    download(surveyParams: SurveyParams, documentId: string): Observable<void> {
        const queryParams: HttpParams = this.buildQueryParams({ responseId: surveyParams.responseId, publicCode: surveyParams.publicCode });
        return this.http.get<void>(`${environment.baseApiUrl}surveys/documents/${documentId}`, { params: queryParams, responseType: 'blob' as 'json', observe: 'response' })
            .pipe(
                map(response => this.downloadService.downloadFile(this.downloadService.convertResponse(response)))
            );
    }
}

