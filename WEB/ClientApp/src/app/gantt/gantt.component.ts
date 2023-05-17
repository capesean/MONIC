import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BreadcrumbService } from '../common/services/breadcrumb.service';
import * as moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { forkJoin } from 'rxjs';
import { ConfirmModalComponent, ModalOptions } from '../common/components/confirm.component';
import { GanttBucket, GanttMilestone, GanttTask, IGanttDate, IGanttProcess } from '../common/models/gantt.model';
import { Milestone, MilestoneSearchOptions } from '../common/models/milestone.model';
import { Project } from '../common/models/project.model';
import { Task, TaskSearchOptions } from '../common/models/task.model';
import { ErrorService } from '../common/services/error.service';
import { MilestoneService } from '../common/services/milestone.service';
import { ProjectService } from '../common/services/project.service';
import { TaskService } from '../common/services/task.service';
import { GanttMilestoneComponent } from './gantt.milestone.component';
import { GanttTaskComponent } from './gantt.task.component';

@Component({
    selector: 'gantt',
    templateUrl: './gantt.component.html',
    styleUrls: ['./gantt.component.css']
})
export class GanttComponent implements OnInit {

    public project = new Project();
    public projectId: string;
    public isNew = false;
    public loaded = false;

    private defaultColour = "#888888";
    public width = '100%';
    public height = '600';
    public type = "gantt";
    public dataFormat = "json";

    protected tasks: Map<string, GanttTask>;
    protected milestones: Map<string, GanttMilestone>;

    public processes: (GanttMilestone | GanttTask)[];
    public buckets: GanttBucket[] = [];

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private errorService: ErrorService,
        private modalService: NgbModal,
        private taskService: TaskService,
        private milestoneService: MilestoneService,
        private projectService: ProjectService,
        private breadcrumbService: BreadcrumbService,
        private toastr: ToastrService
    ) {
    }

    ngOnInit(): void {

        this.route.params.subscribe(params => {

            const projectId = params["projectId"];
            this.isNew = projectId === "add";

            if (!this.isNew) {

                this.project.projectId = projectId;
                this.projectId = projectId;
                this.loadProject();

            }

        });

    }

    public save(form: NgForm): void {

        if (form.invalid) {

            this.toastr.error("The form has not been completed correctly.", "Form Error");
            return;

        }

        this.projectService.save(this.project)
            .subscribe({
                next: project => {
                    this.toastr.success("The project has been saved", "Save Project");
                    if (this.isNew)
                        this.router.navigate(["../", project.projectId], { relativeTo: this.route });
                },
                error: err => {
                    this.errorService.handleError(err, "Theory of Change", "Save");
                }
            });
    }

    public delete(): void {
        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Project", text: "Are you sure you want to delete this project?", deleteStyle: true, ok: "Delete" } as ModalOptions;
        modalRef.result.then(
            () => {

                this.projectService.delete(this.project.projectId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The project has been deleted", "Delete Project");
                            this.router.navigate(["/ganttchart"]);
                        },
                        error: err => {
                            this.errorService.handleError(err, "Project", "Delete");
                        }
                    });

            }, () => { });
    }

    private loadProject(): void {

        this.loaded = false;

        forkJoin({
            project: this.projectService.get(this.projectId),
            milestones: this.milestoneService.search({ projectId: this.projectId, pageSize: 0, includeParents: true } as MilestoneSearchOptions),
            tasks: this.taskService.search({ projectId: this.projectId, pageSize: 0, includeParents: false } as TaskSearchOptions)
        }).subscribe({
            next: response => {

                this.project = response.project;
                this.changeBreadcrumb();

                this.tasks = new Map<string, GanttTask>();
                this.milestones = new Map<string, GanttMilestone>();

                // add the tasks
                response.tasks.tasks.forEach(t => {
                    this.tasks.set(t.taskId, t as GanttTask);
                    this.tasks.get(t.taskId).type = "task";
                });

                // add the milestones
                response.milestones.milestones.forEach(m => {
                    this.milestones.set(m.milestoneId, m as GanttMilestone);
                    this.milestones.get(m.milestoneId).type = "milestone";
                });

                this.createGantt();
            },
            error: err => this.errorService.handleError(err, "Gantt Data", "Load")
        });

    }

    private createGantt(): void {

        // reset the processes
        this.processes = [];

        // get the tasks & milestones from the map
        const tasks = Array.from(this.tasks, ([, value]) => value);
        const milestones = Array.from(this.milestones, ([, value]) => value);

        // build the link (map) between a milestoneId & the associated taskIds
        const taskIdsByMilestoneId = new Map<string, string[]>();
        tasks.forEach(task => {
            if (!taskIdsByMilestoneId.has(task.milestoneId)) taskIdsByMilestoneId.set(task.milestoneId, []);
            taskIdsByMilestoneId.get(task.milestoneId).push(task.taskId);
            // set the tooltip for the task
            task.tooltip = this.getTooltip(task);
        });

        milestones.forEach(milestone => {
            // add the milestone to the processes
            this.processes.push(milestone);

            // reset dates & colour
            milestone.startDate = undefined;
            milestone.endDate = undefined;
            if (!milestone.colour) milestone.colour = this.project.colour || this.defaultColour;
            milestone.barColour = milestone.colour;

            // get the taskIds for this milestone
            if (!taskIdsByMilestoneId.has(milestone.milestoneId)) taskIdsByMilestoneId.set(milestone.milestoneId, []);
            const taskIds = taskIdsByMilestoneId.get(milestone.milestoneId);

            // add each task to the processes
            taskIds.forEach(taskId => {
                const task = this.tasks.get(taskId);
                this.processes.push(task);
                // set the task dates & colour
                if (milestone.startDate === undefined || milestone.startDate > task.startDate) milestone.startDate = task.startDate;
                if (milestone.endDate === undefined || milestone.endDate < task.endDate) milestone.endDate = task.endDate;
                if (!task.colour) task.colour = milestone.colour;
                task.barColour = this.rgbToHex(this.fadeRgb(this.hexToRgb(task.colour)));
            });

            // set the tooltip now that the dates are determined
            milestone.tooltip = this.getTooltip(milestone);
        });

        this.processes.sort((a, b) => {
            const sortA = this.getProcessSortString(a), sortB = this.getProcessSortString(b);

            if (sortA < sortB) return -1;
            if (sortA > sortB) return 1;
            return 0;
        });

        // find the min & max date to calculate the overall range
        const minStartDate = moment(new Date(Math.min(...milestones.filter(o => !!o.startDate).map(o => o.startDate.getTime())))).startOf("month");
        const maxendDate = moment(new Date(Math.max(...milestones.filter(o => !!o.endDate).map(o => o.endDate.getTime())))).endOf("month");
        const timeRange = maxendDate.valueOf() - minStartDate.valueOf();

        // calculate the offset & width for each process (milestones & tasks)
        this.processes.forEach(process => {
            if (isNaN(timeRange)) {
                process.width = 0;
                process.left = 0;
            } else {
                this.calcWidthAndOffset(process, minStartDate, timeRange);
            }
        });

        // build the date buckets
        this.buckets = [];
        if (!isNaN(timeRange)) {
            var interim = moment(minStartDate).clone();
            while (maxendDate > interim || interim.format('M') === maxendDate.format('M')) {
                const bucket = new GanttBucket();
                bucket.startDate = interim.startOf("month").toDate();
                bucket.endDate = interim.endOf("month").toDate();
                bucket.label = interim.format('MMM YYYY');
                this.calcWidthAndOffset(bucket, minStartDate, timeRange);
                this.buckets.push(bucket);
                interim.add(1, 'month');
            }
        }

        this.loaded = true;
    }

    private getProcessSortString(process: GanttTask | GanttMilestone): string {
        // sort by: the milestone start date, then the milestoneid, then the process start date, then by milestone before tasks
        return (process.type === "milestone" ? this.getDateSortString(process.startDate) : this.getDateSortString(this.milestones.get(process.milestoneId).startDate))
            + process.milestoneId
            + this.getDateSortString(process.startDate)
            + (process.type === "milestone" ? "0" : "1");
    }

    private getDateSortString(date: Date): string {
        // milestones with no tasks will have undefined start dates, and should be sorted to the end
        if (date === undefined) return "99999999";
        return moment(date).format("YYYYMMDD");
    }

    private calcWidthAndOffset(ganttDate: IGanttDate, minStartDate: moment.Moment, timeRange: number) {
        const offsetStart = moment(ganttDate.startDate).valueOf() - minStartDate.valueOf();
        const offsetEnd = moment(ganttDate.endDate).valueOf() - minStartDate.valueOf();
        ganttDate.width = (offsetEnd - offsetStart) / timeRange * 100;
        ganttDate.left = offsetStart / timeRange * 100;
    }

    public processClick(process: IGanttProcess): void {

        if (process.type === "task") {

            this.showTask((process as GanttTask).taskId);

        } else if (process.type === "milestone") {

            this.showMilestone((process as GanttMilestone).milestoneId);

        } else {
            throw "Unknown id in showProcess()";
        }
    }

    private showTask(taskId: string) {
        const task = this.tasks.get(taskId);
        const milestone = this.milestones.get(task.milestoneId);
        this.openTaskModal(milestone, task);
    }

    public addTask($event: MouseEvent, milestone: GanttMilestone | GanttTask): void {
        $event.stopPropagation();
        this.openTaskModal(milestone as GanttMilestone);
    }

    private openTaskModal(milestone: Milestone, task?: Task): void {
        let modalRef = this.modalService.open(GanttTaskComponent, { size: 'xl', centered: true, scrollable: true });
        (modalRef.componentInstance as GanttTaskComponent).setTask(milestone, task);
        modalRef.result.then(
            (response: GanttTask | string) => {
                if (response === "deleted") {
                    this.tasks.delete(task.taskId);
                } else {
                    (response as GanttTask).type = "task";
                    this.tasks.set((response as Task).taskId, (response as GanttTask));
                }
                // todo: handle errors on save?
                this.createGantt();
            }, () => { });
    }

    private showMilestone(milestoneId: string) {
        this.openMilestoneModal(this.milestones.get(milestoneId));
    }

    public addMilestone(): void {
        this.openMilestoneModal();
    }

    private openMilestoneModal(milestone?: Milestone): void {
        let modalRef = this.modalService.open(GanttMilestoneComponent, { size: 'xl', centered: true, scrollable: true });
        (modalRef.componentInstance as GanttMilestoneComponent).setMilestone(this.project, milestone);
        modalRef.result.then(
            (response: GanttMilestone | string) => {
                if (response === "deleted") {
                    this.milestones.delete(milestone.milestoneId);
                } else {
                    (response as GanttMilestone).type = "milestone";
                    this.milestones.set((response as Milestone).milestoneId, (response as GanttMilestone));
                }
                // todo: handle errors on save?
                this.createGantt();
            }, reason => {
                // user clicked add task button...
                if (reason === "newtask") {
                    this.openTaskModal(milestone);
                }
            });
    }

    private getTooltip(process: IGanttDate): string {
        if (!process.startDate || !process.endDate) return "";
        if (process.startDate.getTime() === process.endDate.getTime()) return moment(process.startDate).format("DD MMM");
        return moment(process.startDate).format("DD MMM") + " to " + moment(process.endDate).format("DD MMM");
    }

    private componentToHex(c: number): string {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }

    private rgbToHex(rgb: rgb): string {
        return "#" + this.componentToHex(rgb.r) + this.componentToHex(rgb.g) + this.componentToHex(rgb.b);
    }

    private hexToRgb(hex: string): rgb {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : undefined;
    }

    private fadeRgb(rgb: rgb): rgb {
        rgb.r = this.fadeComponent(rgb.r);
        rgb.g = this.fadeComponent(rgb.g);
        rgb.b = this.fadeComponent(rgb.b);
        return rgb;
    }

    private fadeComponent(c: number): number {
        let start = c;
        let end = 255; // white
        let offset = (start - end) * 0.5; // 50%
        if (offset >= 0) Math.abs(offset);
        return Math.ceil(start - offset);
    }

    public changeBreadcrumb(): void {
        this.breadcrumbService.changeBreadcrumb(this.route.snapshot, this.project.name !== undefined ? this.project.name.substring(0, 25) : "(new project)");
    }

}

class rgb {
    r: number;
    g: number;
    b: number;
}
