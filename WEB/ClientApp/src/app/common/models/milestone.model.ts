import { SearchOptions, PagingHeaders } from './http.model';
import { Project } from './project.model';
import { Task } from './task.model';

export class Milestone {
    milestoneId: string;
    name: string;
    projectId: string;
    description: string;
    colour: string;
    sortOrder: number;
    project: Project;

    tasks: Task[];

    constructor() {
        this.milestoneId = "00000000-0000-0000-0000-000000000000";
        this.tasks = [];
    }
}

export class MilestoneSearchOptions extends SearchOptions {
    q: string;
    projectId: string;
}

export class MilestoneSearchResponse {
    milestones: Milestone[] = [];
    headers: PagingHeaders;
}
