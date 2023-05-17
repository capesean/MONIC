import { Component, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { TaskService } from '../common/services/task.service';
import { ErrorService } from '../common/services/error.service';
import { Task } from '../common/models/task.model';
import { NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ConfirmModalComponent, ModalOptions } from '../common/components/confirm.component';
import { Milestone } from '../common/models/milestone.model';

@Component({
    selector: 'gantt-task',
    templateUrl: './gantt.task.component.html'
})
export class GanttTaskComponent implements OnInit {

    public task: Task;
    public milestone: Milestone;
    public isNew = true;

    constructor(
        public modal: NgbActiveModal,
        private taskService: TaskService,
        private toastr: ToastrService,
        private errorService: ErrorService,
        private modalService: NgbModal
    ) {
    }

    ngOnInit(): void {
    }

    public setTask(milestone: Milestone, task: Task) {
        this.milestone = milestone;
        if (task == undefined) {
            this.task = new Task();
            this.task.milestoneId = milestone.milestoneId;
        } else {
            this.isNew = false;
            // clone to avoid cancelled changes affecting source page
            this.task = { ...task };
        }
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
                    this.modal.close(task);
                },
                error: err => {
                    this.errorService.handleError(err, "Task", "Save");
                }
            });

    }

    delete(): void {

        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Task", text: "Are you sure you want to delete this task?", deleteStyle: true, ok: "Delete" } as ModalOptions;
        modalRef.result.then(
            () => {

                this.taskService.delete(this.task.taskId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The task has been deleted", "Delete Task");
                            this.modal.close("deleted");
                        },
                        error: err => {
                            this.errorService.handleError(err, "Task", "Delete");
                        }
                    });

            }, () => { });

    }
}
