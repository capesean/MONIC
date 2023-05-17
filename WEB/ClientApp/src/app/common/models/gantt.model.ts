import { Milestone } from "./milestone.model";
import { Task } from "./task.model";

export class GanttMilestone extends Milestone implements IGanttProcess {
    public type: string;
    public width: number;
    public left: number;
    public tooltip: string;
    public startDate: Date;
    public endDate: Date;
    public barColour: string;
    public percentCompleted: number;
}

export class GanttTask extends Task implements IGanttProcess, IGanttDate {
    public type: string;
    public tooltip: string;
    public width: number;
    public left: number;
    public barColour: string;
}

export interface IGanttDate {
    width: number;
    left: number;
    startDate: Date;
    endDate: Date;
}

export interface IGanttProcess {
    type: string;
    width: number;
    left: number;
    tooltip: string;
    barColour: string;
}

export class GanttBucket implements IGanttDate {
    public startDate: Date;
    public endDate: Date;
    public label: string;
    public width: number;
    public left: number;
}
