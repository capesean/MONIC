import { Component as NgComponent, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PagingHeaders } from '../../common/models/http.model';
import { SectionSearchOptions, SectionSearchResponse, Section } from '../../common/models/section.model';
import { FadeThenShrink } from '../../common/animations/fadethenshrink';
import { ErrorService } from '../../common/services/error.service';
import { SectionService } from '../../common/services/section.service';
import { SectionSortComponent } from './section.sort.component';

@NgComponent({
    selector: 'section-list',
    templateUrl: './section.list.component.html',
    animations: [FadeThenShrink]
})
export class SectionListComponent implements OnInit, OnDestroy {

    public sections: Section[] = [];
    public searchOptions = new SectionSearchOptions();
    public showSearchOptions = false;
    public headers = new PagingHeaders();
    private routerSubscription: Subscription;

    constructor(
        public route: ActivatedRoute,
        private router: Router,
        private errorService: ErrorService,
        private modalService: NgbModal,
        private sectionService: SectionService
    ) {
    }

    ngOnInit(): void {
        this.searchOptions.includeParents = true;
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

    runSearch(pageIndex = 0): Subject<SectionSearchResponse> {

        this.searchOptions.pageIndex = pageIndex;

        const subject = new Subject<SectionSearchResponse>();

        this.sectionService.search(this.searchOptions)
            .subscribe({
                next: response => {
                    subject.next(response);
                    this.sections = response.sections;
                    this.headers = response.headers;
                },
                error: err => {
                    this.errorService.handleError(err, "Sections", "Load");
                }
            });

        return subject;

    }

    showSort(): void {
        let modalRef = this.modalService.open(SectionSortComponent, { size: 'xl', centered: true, scrollable: false });
        modalRef.result.then(
            () => {

                this.searchOptions.orderBy = null;
                this.runSearch(this.headers.pageIndex);

            }, () => { });
    }

    goToSection(section: Section): void {
        this.router.navigate(["/questionnaires", section.questionnaire.questionnaireId, "sections", section.sectionId]);
    }
}

