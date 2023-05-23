import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Questionnaire, QuestionnaireSearchOptions, QuestionnaireSearchResponse } from '../models/questionnaire.model';
import { SearchQuery, PagingHeaders } from '../models/http.model';
import { DownloadModel } from '../models/download.model';
import { DownloadService } from './download.service';
import { SurveyProgress } from '../models/survey.model';
import { QuestionSummary } from '../models/questionsummary.model';
import { Date } from '../models/date.model';
import { Question } from '../models/question.model';

@Injectable({ providedIn: 'root' })
export class QuestionnaireService extends SearchQuery {

    constructor(private http: HttpClient, private downloadService: DownloadService) {
        super();
    }

    search(params: QuestionnaireSearchOptions): Observable<QuestionnaireSearchResponse> {
        const queryParams: HttpParams = this.buildQueryParams(params);
        return this.http.get(`${environment.baseApiUrl}questionnaires`, { params: queryParams, observe: 'response' })
            .pipe(
                map(response => {
                    const headers = JSON.parse(response.headers.get("x-pagination")) as PagingHeaders;
                    const questionnaires = response.body as Questionnaire[];
                    return { questionnaires: questionnaires, headers: headers };
                })
            );
    }

    get(questionnaireId: string): Observable<Questionnaire> {
        return this.http.get<Questionnaire>(`${environment.baseApiUrl}questionnaires/${questionnaireId}`);
    }

    save(questionnaire: Questionnaire): Observable<Questionnaire> {
        return this.http.post<Questionnaire>(`${environment.baseApiUrl}questionnaires/${questionnaire.questionnaireId}`, questionnaire);
    }

    delete(questionnaireId: string): Observable<void> {
        return this.http.delete<void>(`${environment.baseApiUrl}questionnaires/${questionnaireId}`);
    }

    deleteSections(questionnaireId: string): Observable<void> {
        return this.http.delete<void>(`${environment.baseApiUrl}questionnaires/${questionnaireId}/sections`);
    }

    deleteResponses(questionnaireId: string): Observable<void> {
        return this.http.delete<void>(`${environment.baseApiUrl}questionnaires/${questionnaireId}/responses`);
    }

    export(exportModel: ExportModel): Observable<void> {
        return this.http.post<DownloadModel>(`${environment.baseApiUrl}questionnaires/export`, exportModel, { responseType: 'blob' as 'json', observe: 'response' })
            .pipe(
                map(response => this.downloadService.downloadFile(this.downloadService.convertResponse(response)))
            );
    }

    getProgress(questionnaireId: string, dateId: string, entityIds: string[]): Observable<SurveyProgress[]> {
        return this.http.post<SurveyProgress[]>(`${environment.baseApiUrl}questionnaires/${questionnaireId}/progress/${dateId}`, entityIds);
    }

    download(questionnaireId: string, responseId: string, dateId: string, includeSkipLogic: boolean, includeSummaries: boolean): Observable<void> {
        return this.http.get<DownloadModel>(`${environment.baseApiUrl}questionnaires/${questionnaireId}/download?responseId=${(responseId ?? "")}&dateId=${(dateId ?? "")}&includeSkipLogic=${includeSkipLogic}&includeSummaries=${includeSummaries}`, { responseType: 'blob' as 'json', observe: 'response' })
            .pipe(
                map(response => this.downloadService.downloadFile(this.downloadService.convertResponse(response)))
            );
    }

    generateSummary(generateSummariesModel: GenerateSummariesModel): Observable<QuestionSummary> {
        return this.http.post<QuestionSummary>(`${environment.baseApiUrl}questionnaires/generatesummaries`, generateSummariesModel);
    }
}

export class ExportModel {
    public questionnaireId: string;
    public entityIds: string[] = [];
    public fieldIds: string[] = [];
    public dateIds: string[] = [];
    public includeSummaries: boolean;
    public useOptionValues: boolean;
    public useOptionColors: boolean;
    public includeCharts: boolean;
}

export class GenerateSummariesModel {
    public questionnaireId: string;
    public questionnaire: Questionnaire;
    public questionId: string;
    public question: Question;
    public dateId: string;
    public date: Date;
    public maxTokens: number;
    public temperature: number;
}
