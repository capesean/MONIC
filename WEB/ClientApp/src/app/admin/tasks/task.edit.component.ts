import { Component as NgComponent, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmModalComponent, ConfirmModalOptions } from '../../common/components/confirm.component';
import { Task } from '../../common/models/task.model';
import { BreadcrumbService } from '../../common/services/breadcrumb.service';
import { ErrorService } from '../../common/services/error.service';
import { TaskService } from '../../common/services/task.service';

@NgComponent({
    selector: 'task-edit',
    templateUrl: './task.edit.component.html'
})
export class TaskEditComponent implements OnInit {

    public task: Task = new Task();
    public isNew = true;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private toastr: ToastrService,
        private breadcrumbService: BreadcrumbService,
        private modalService: NgbModal,
        private taskService: TaskService,
        private errorService: ErrorService
    ) {
    }

    ngOnInit(): void {

        this.route.params.subscribe(params => {

            const taskId = params["taskId"];
            this.task.milestoneId = this.route.snapshot.parent.params.milestoneId;
            this.isNew = taskId === "add";

            if (!this.isNew) {

                this.task.taskId = taskId;
                this.loadTask();

            }

        });

    }

    private loadTask(): void {

        this.taskService.get(this.task.taskId)
            .subscribe({
                next: task => {
                    this.task = task;
                    this.changeBreadcrumb();
                },
                error: err => {
                    this.errorService.handleError(err, "Task", "Load");
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

        this.taskService.save(this.task)
            .subscribe({
                next: task => {
                    this.toastr.success("The task has been saved", "Save Task");
                    if (this.isNew) this.router.navigate(["../", task.taskId], { relativeTo: this.route });
                },
                error: err => {
                    this.errorService.handleError(err, "Task", "Save");
                }
            });

    }

    delete(): void {

        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Task", text: "Are you sure you want to delete this task?", deleteStyle: true, ok: "Delete" } as ConfirmModalOptions;
        modalRef.result.then(
            () => {

                this.taskService.delete(this.task.taskId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The task has been deleted", "Delete Task");
                            this.router.navigate(["../../"], { relativeTo: this.route });
                        },
                        error: err => {
                            this.errorService.handleError(err, "Task", "Delete");
                        }
                    });

            }, () => { });
    }

    changeBreadcrumb(): void {
        this.breadcrumbService.changeBreadcrumb(this.route.snapshot, this.task.name !== undefined ? this.task.name.substring(0, 25) : "(new task)");
    }

}
