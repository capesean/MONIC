import { Component, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { MilestoneService } from '../common/services/milestone.service';
import { ErrorService } from '../common/services/error.service';
import { Milestone } from '../common/models/milestone.model';
import { NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ConfirmModalComponent, ConfirmModalOptions } from '../common/components/confirm.component';
import { Project } from '../common/models/project.model';

@Component({
    selector: 'gantt-milestone',
    templateUrl: './gantt.milestone.component.html'
})
export class GanttMilestoneComponent implements OnInit {

    public project: Project;
    public milestone: Milestone;
    public isNew = true;

    constructor(
        public modal: NgbActiveModal,
        private milestoneService: MilestoneService,
        private toastr: ToastrService,
        private errorService: ErrorService,
        private modalService: NgbModal
    ) {
    }

    ngOnInit(): void {
    }

    public setMilestone(project: Project, milestone: Milestone) {
        this.project = project;

        if (milestone == undefined) {
            this.milestone = new Milestone();
            this.milestone.projectId = project.projectId;
        } else {
            this.isNew = false;
            // clone to avoid cancelled changes affecting source page
            this.milestone = { ...milestone };
        }

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
                    this.modal.close(milestone);
                },
                error: err => {
                    this.errorService.handleError(err, "Milestone", "Save");
                }
            });

    }

    delete(): void {

        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Milestone", text: "Are you sure you want to delete this milestone?", deleteStyle: true, ok: "Delete" } as ConfirmModalOptions;
        modalRef.result.then(
            () => {

                this.milestoneService.delete(this.milestone.milestoneId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The milestone has been deleted", "Delete Milestone");
                            this.modal.close("deleted");
                        },
                        error: err => {
                            this.errorService.handleError(err, "Milestone", "Delete");
                        }
                    });

            }, () => { });

    }

    addTask(): void {
        this.modal.dismiss("newtask");
    }
}
