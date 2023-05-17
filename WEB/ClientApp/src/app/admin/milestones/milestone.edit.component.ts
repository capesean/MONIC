import { Component as NgComponent, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmModalComponent, ModalOptions } from '../../common/components/confirm.component';
import { PagingHeaders } from '../../common/models/http.model';
import { Milestone } from '../../common/models/milestone.model';
import { BreadcrumbService } from '../../common/services/breadcrumb.service';
import { ErrorService } from '../../common/services/error.service';
import { MilestoneService } from '../../common/services/milestone.service';
import { Task, TaskSearchOptions, TaskSearchResponse } from '../../common/models/task.model';
import { TaskService } from '../../common/services/task.service';

@NgComponent({
    selector: 'milestone-edit',
    templateUrl: './milestone.edit.component.html'
})
export class MilestoneEditComponent implements OnInit, OnDestroy {

    public milestone: Milestone = new Milestone();
    public isNew = true;
    private routerSubscription: Subscription;

    public tasksSearchOptions = new TaskSearchOptions();
    public tasksHeaders = new PagingHeaders();
    public tasks: Task[] = [];
    public showTasksSearch = false;

    constructor(
        private router: Router,
        public route: ActivatedRoute,
        private toastr: ToastrService,
        private breadcrumbService: BreadcrumbService,
        private modalService: NgbModal,
        private milestoneService: MilestoneService,
        private taskService: TaskService,
        private errorService: ErrorService
    ) {
    }

    ngOnInit(): void {

        this.route.params.subscribe(params => {

            const milestoneId = params["milestoneId"];
            this.milestone.projectId = this.route.snapshot.parent.params.projectId;
            this.isNew = milestoneId === "add";

            if (!this.isNew) {

                this.milestone.milestoneId = milestoneId;
                this.loadMilestone();

                this.tasksSearchOptions.milestoneId = milestoneId;
                this.tasksSearchOptions.includeParents = true;
                this.searchTasks();

            }

            this.routerSubscription = this.router.events.subscribe(event => {
                if (event instanceof NavigationEnd && !this.route.firstChild) {
                    // this will double-load on new save, as params change (above) + nav ends
                    this.searchTasks();
                }
            });

        });

    }

    ngOnDestroy(): void {
        this.routerSubscription.unsubscribe();
    }

    private loadMilestone(): void {

        this.milestoneService.get(this.milestone.milestoneId)
            .subscribe({
                next: milestone => {
                    this.milestone = milestone;
                    this.changeBreadcrumb();
                },
                error: err => {
                    this.errorService.handleError(err, "Milestone", "Load");
                    if (err instanceof HttpErrorResponse && err.status === 404)
                        this.router.navigate(["../../"], { relativeTo: this.route });
                }
            });

    }

    save(form: NgForm): void {

        if (form.invalid) {

            this.toastr.error("The form has not been completed correctly.", "Form Error");
            return;

        }

        this.milestoneService.save(this.milestone)
            .subscribe({
                next: milestone => {
                    this.toastr.success("The milestone has been saved", "Save Milestone");
                    if (this.isNew) {
                        this.ngOnDestroy();
                        this.router.navigate(["../", milestone.milestoneId], { relativeTo: this.route });
                    }
                },
                error: err => {
                    this.errorService.handleError(err, "Milestone", "Save");
                }
            });

    }

    delete(): void {

        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Milestone", text: "Are you sure you want to delete this milestone?", deleteStyle: true, ok: "Delete" } as ModalOptions;
        modalRef.result.then(
            () => {

                this.milestoneService.delete(this.milestone.milestoneId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The milestone has been deleted", "Delete Milestone");
                            this.router.navigate(["../../"], { relativeTo: this.route });
                        },
                        error: err => {
                            this.errorService.handleError(err, "Milestone", "Delete");
                        }
                    });

            }, () => { });
    }

    changeBreadcrumb(): void {
        this.breadcrumbService.changeBreadcrumb(this.route.snapshot, this.milestone.name !== undefined ? this.milestone.name.substring(0, 25) : "(new milestone)");
    }

    searchTasks(pageIndex = 0): Subject<TaskSearchResponse> {

        this.tasksSearchOptions.pageIndex = pageIndex;

        const subject = new Subject<TaskSearchResponse>()

        this.taskService.search(this.tasksSearchOptions)
            .subscribe({
                next: response => {
                    subject.next(response);
                    this.tasks = response.tasks;
                    this.tasksHeaders = response.headers;
                },
                error: err => {
                    this.errorService.handleError(err, "Tasks", "Load");
                }
            });

        return subject;

    }

    goToTask(task: Task): void {
        this.router.navigate(["tasks", task.taskId], { relativeTo: this.route });
    }

    deleteTask(task: Task, event: MouseEvent): void {
        event.stopPropagation();

        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Task", text: "Are you sure you want to delete this task?", deleteStyle: true, ok: "Delete" } as ModalOptions;
        modalRef.result.then(
            () => {

                this.taskService.delete(task.taskId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The task has been deleted", "Delete Task");
                            this.searchTasks(this.tasksHeaders.pageIndex);
                        },
                        error: err => {
                            this.errorService.handleError(err, "Task", "Delete");
                        }
                    });

            }, () => { });
    }

    deleteTasks(): void {
        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Tasks", text: "Are you sure you want to delete all the tasks?", deleteStyle: true, ok: "Delete" } as ModalOptions;
        modalRef.result.then(
            () => {

                this.milestoneService.deleteTasks(this.milestone.milestoneId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The tasks have been deleted", "Delete Tasks");
                            this.searchTasks();
                        },
                        error: err => {
                            this.errorService.handleError(err, "Tasks", "Delete");
                        }
                    });
            }, () => { });

    }

}
