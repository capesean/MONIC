import { Component as NgComponent, OnInit, ViewChild, Output, EventEmitter, TemplateRef, Input } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { ProjectSearchOptions, ProjectSearchResponse, Project } from '../../common/models/project.model';
import { ProjectService } from '../../common/services/project.service';
import { PagingHeaders } from '../../common/models/http.model';
import { ErrorService } from '../../common/services/error.service';

@NgComponent({
    selector: 'project-modal',
    templateUrl: './project.modal.component.html',
    standalone: false
})
export class ProjectModalComponent implements OnInit {

    public modal: NgbModalRef;
    public selectedItems: Project[] = [];
    public headers: PagingHeaders = new PagingHeaders();
    public searchOptions: ProjectSearchOptions = new ProjectSearchOptions();
    public projects: Project[];
    public allSelected = false;

    @ViewChild('content') content: TemplateRef<unknown>;
    @Output() change: EventEmitter<Project> = new EventEmitter<Project>();
    @Output() changes: EventEmitter<Project[]> = new EventEmitter<Project[]>();
    @Input() canRemoveFilters = false;
    @Input() multiple = false;
    @Input() showAddNew = false;
    @Input() showFilters = true;
    @Input() showFooter = true;
    @Input() resetOnOpen = false;
    @Input() title = this.multiple ? "Select projects" : "Select a project";

    constructor(
        private modalService: NgbModal,
        private projectService: ProjectService,
        private errorService: ErrorService
    ) {
    }

    ngOnInit(): void {
        this.searchOptions.includeParents = true;
    }

    open(): NgbModalRef {
        if (this.resetOnOpen) this.selectedItems = [];
        this.modal = this.modalService.open(this.content, { size: 'xl', centered: true, scrollable: false });
        this.runSearch();
        this.modal.result.then((project: Project | Project[]) => {
            if (this.multiple) this.changes.emit(project as Project[]);
            else this.change.emit(project as Project);
        }, () => {
            // dismissed
        });
        return this.modal;
    }

    public runSearch(pageIndex = 0): Observable<ProjectSearchResponse> {

        this.searchOptions.pageIndex = pageIndex;
        this.allSelected = false;

        const observable = this.projectService
            .search(this.searchOptions);

        observable.subscribe({
            next: response => {
                this.projects = response.projects;
                this.headers = response.headers;
            },
            error: err => {

                this.errorService.handleError(err, "Projects", "Load");

            }
        });

        return observable;

    }

    close() {
        if (this.multiple) this.modal.close(this.selectedItems);
        else this.modal.dismiss();
    }

    clear() {
        if (this.multiple) { this.selectedItems = []; this.modal.close([]); }
        else this.modal.close(undefined);
    }

    select(project: Project) {
        if (this.multiple) {
            if (this.isSelected(project)) {
                for (let i = 0; i < this.selectedItems.length; i++) {
                    if (this.selectedItems[i].projectId === project.projectId) {
                        this.selectedItems.splice(i, 1);
                        break;
                    }
                }
            } else {
                this.selectedItems.push(project);
            }
        } else {
            this.modal.close(project);
        }
    }

    isSelected(project: Project) {
        if (!this.multiple) return false;
        return this.selectedItems.filter(item => item.projectId === project.projectId).length > 0;
    }

    toggleAll() {
        this.allSelected = !this.allSelected;
        this.projects.forEach(project => {
            const isSelected = this.isSelected(project);
			if (isSelected && !this.allSelected) {
                for (let i = 0; i < this.selectedItems.length; i++) {
                    if (this.selectedItems[i].projectId === project.projectId) {
                        this.selectedItems.splice(i, 1);
                        break;
                    }
                }
            } else if (!isSelected && this.allSelected) {
                this.selectedItems.push(project);
            }
        });
    }

    selectAll() {

        const oldPageSize = this.searchOptions.pageSize;
        this.searchOptions.pageSize = 0;
        this.searchOptions.pageIndex = 0;

        this.projectService.search(this.searchOptions)
            .subscribe({
                next: response => {
                    this.modal.close(response.projects);
                    this.projects = response.projects;
                    this.searchOptions.pageSize = oldPageSize;
                },
                error: err => {
                    this.errorService.handleError(err, "Projects", "Load");
                }
            });

    }

    addNew() {
        window.open("/projects/add", "_blank");
    }
}
