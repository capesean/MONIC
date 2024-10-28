import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { PagingHeaders } from '../common/models/http.model';
import { ErrorService } from '../common/services/error.service';
import { OnDestroy } from '@angular/core';
import { Response, ResponseSearchOptions } from '../common/models/response.model';
import { ResponseService } from '../common/services/response.service';
import { ToastrService } from 'ngx-toastr';
import { Clipboard } from '@angular/cdk/clipboard';
import { environment } from '../../environments/environment';
import { QuestionnaireService } from '../common/services/questionnaire.service';
import { FadeThenShrink } from '../common/animations/fadethenshrink';

@Component({
    selector: 'app-questionnaires',
    templateUrl: './questionnaires.component.html',
    animations: [FadeThenShrink]
})
export class QuestionnairesComponent implements OnInit, OnDestroy {

    public responses: Response[] = [];
    public searchOptions = new ResponseSearchOptions();
    public showSearchOptions = false;
    public headers = new PagingHeaders();

    private routerSubscription: Subscription;

    constructor(
        public route: ActivatedRoute,
        private router: Router,
        private errorService: ErrorService,
        private responseService: ResponseService,
        private questionnaireService: QuestionnaireService,
        private toastr: ToastrService,
        private clipboard: Clipboard
    ) {
    }

    ngOnInit(): void {
        this.routerSubscription = this.router.events.subscribe(event => {
            if (event instanceof NavigationEnd && !this.route.firstChild) {
                this.runSearch();
            }
        });
        this.runSearch();
    }

    ngOnDestroy(): void {
        this.routerSubscription.unsubscribe();
    }

    runSearch(pageIndex = 0): void {

        this.searchOptions.pageIndex = pageIndex;
        this.searchOptions.includeParents = true;

        this.responseService.search(this.searchOptions)
            .subscribe({
                next: response => {
                    this.responses = response.responses;
                    this.headers = response.headers;
                },
                error: err => {
                    this.errorService.handleError(err, "Questionnaire Responses", "Load");
                }
            });

    }

    status($event: MouseEvent, response: Response): void {
        $event.stopPropagation();
        alert("not implemented yet");
    }

    download($event: MouseEvent, response: Response): void {
        $event.stopPropagation();
        this.questionnaireService.download(response.questionnaireId, response.responseId, undefined, false, false)
            .subscribe({
                error: err => this.errorService.handleError(err, "PDF", "Download")
            });
    }

    selectResponse(response: Response): void {
        this.router.navigate([response.responseId], { relativeTo: this.route });
    }

    copyPublicUrl($event: MouseEvent, response: Response): void {
        $event.stopPropagation();
        if (!response.publicCode) {
            this.toastr.error("This response does not have a public code (URL).");
            return;
        }
        this.clipboard.copy(`${environment.baseUrl}public/response/${response.publicCode}`);
        this.toastr.success("The public access URL has been copied to the clipboard.");
    }

}
