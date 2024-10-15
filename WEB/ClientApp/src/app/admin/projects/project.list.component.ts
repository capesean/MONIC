import { Component as NgComponent, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { PagingHeaders } from '../../common/models/http.model';
import { ProjectSearchOptions, ProjectSearchResponse, Project } from '../../common/models/project.model';
import { FadeThenShrink } from '../../common/animations/fadethenshrink';
import { ErrorService } from '../../common/services/error.service';
import { ProjectService } from '../../common/services/project.service';

@NgComponent({
    selector: 'project-list',
    templateUrl: './project.list.component.html',
    animations: [FadeThenShrink]
})
export class ProjectListComponent implements OnInit, OnDestroy {

    public projects: Project[] = [];
    public searchOptions = new ProjectSearchOptions();
    public showSearchOptions = false;
    public headers = new PagingHeaders();
    private routerSubscription: Subscription;

    constructor(
        public route: ActivatedRoute,
        private router: Router,
        private errorService: ErrorService,
        private projectService: ProjectService
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

    runSearch(pageIndex = 0): Subject<ProjectSearchResponse> {

        this.searchOptions.pageIndex = pageIndex;

        const subject = new Subject<ProjectSearchResponse>();

        this.projectService.search(this.searchOptions)
            .subscribe({
                next: response => {
                    subject.next(response);
                    this.projects = response.projects;
                    this.headers = response.headers;
                },
                error: err => {
                    this.errorService.handleError(err, "Projects", "Load");
                }
            });

        return subject;

    }

    goToProject(project: Project): void {
        this.router.navigate([project.projectId], { relativeTo: this.route });
    }
}

