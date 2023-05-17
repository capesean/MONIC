import { SearchOptions, PagingHeaders } from './http.model';
import { Milestone } from './milestone.model';

export class Task {
    taskId: string;
    name: string;
    milestoneId: string;
    startDate: Date;
    endDate: Date;
    percentCompleted: number;
    completionDate: Date;
    description: string;
    colour: string;
    milestone: Milestone;

    constructor() {
        this.taskId = "00000000-0000-0000-0000-000000000000";
        this.percentCompleted = 0;
    }
}

export class TaskSearchOptions extends SearchOptions {
    q: string;
    milestoneId: string;
    projectId: string;
}

export class TaskSearchResponse {
    tasks: Task[] = [];
    headers: PagingHeaders;
}
