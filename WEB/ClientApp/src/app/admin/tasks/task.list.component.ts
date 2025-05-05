import { Component as NgComponent, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { PagingHeaders } from '../../common/models/http.model';
import { TaskSearchOptions, TaskSearchResponse, Task } from '../../common/models/task.model';
import { FadeThenShrink } from '../../common/animations/fadethenshrink';
import { ErrorService } from '../../common/services/error.service';
import { TaskService } from '../../common/services/task.service';

@NgComponent({
    selector: 'task-list',
    templateUrl: './task.list.component.html',
    animations: [FadeThenShrink],
    standalone: false
})
export class TaskListComponent implements OnInit {

    public tasks: Task[] = [];
    public searchOptions = new TaskSearchOptions();
    public showSearchOptions = false;
    public headers = new PagingHeaders();

    constructor(
        public route: ActivatedRoute,
        private router: Router,
        private errorService: ErrorService,
        private taskService: TaskService
    ) {
    }

    ngOnInit(): void {
        this.searchOptions.includeParents = true;
        this.runSearch();
    }

    runSearch(pageIndex = 0): Subject<TaskSearchResponse> {

        this.searchOptions.pageIndex = pageIndex;

        const subject = new Subject<TaskSearchResponse>();

        this.taskService.search(this.searchOptions)
            .subscribe({
                next: response => {
                    subject.next(response);
                    this.tasks = response.tasks;
                    this.headers = response.headers;
                },
                error: err => {
                    this.errorService.handleError(err, "Tasks", "Load");
                }
            });

        return subject;

    }

    goToTask(task: Task): void {
        this.router.navigate(["/projects", task.milestone.project.projectId, "milestones", task.milestone.milestoneId, "tasks", task.taskId]);
    }
}

