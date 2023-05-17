import { SearchOptions, PagingHeaders } from './http.model';
import { Milestone } from './milestone.model';

export class Project {
    projectId: string;
    name: string;
    colour: string;

    milestones: Milestone[];

    constructor() {
        this.projectId = "00000000-0000-0000-0000-000000000000";
    }
}

export class ProjectSearchOptions extends SearchOptions {
    q: string;
}

export class ProjectSearchResponse {
    projects: Project[] = [];
    headers: PagingHeaders;
}
