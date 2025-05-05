import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { PagingHeaders } from '../common/models/http.model';
import { Project, ProjectSearchOptions } from '../common/models/project.model';
import { ErrorService } from '../common/services/error.service';
import { ProjectService } from '../common/services/project.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-gantts',
    templateUrl: './gantts.component.html',
    standalone: false
})
export class GanttsComponent implements OnInit, OnDestroy {

    public projects: Project[] = [];
    public searchOptions = new ProjectSearchOptions();
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

    runSearch(pageIndex = 0): void {

        this.searchOptions.pageIndex = pageIndex;

        this.projectService.search(this.searchOptions)
            .subscribe({
                next: response => {
                    this.projects = response.projects;
                    this.headers = response.headers;
                },
                error: err => {
                    this.errorService.handleError(err, "Projects", "Load");
                }
            });

    }

    public selectProject(project: Project): void {
        this.router.navigate([project.projectId], { relativeTo: this.route });
    }
}
