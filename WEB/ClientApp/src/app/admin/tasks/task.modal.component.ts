import { Component as NgComponent, OnInit, ViewChild, Output, EventEmitter, TemplateRef, Input } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { TaskSearchOptions, TaskSearchResponse, Task } from '../../common/models/task.model';
import { TaskService } from '../../common/services/task.service';
import { PagingHeaders } from '../../common/models/http.model';
import { ErrorService } from '../../common/services/error.service';
import { Milestone } from '../../common/models/milestone.model';

@NgComponent({
    selector: 'task-modal',
    templateUrl: './task.modal.component.html',
    standalone: false
})
export class TaskModalComponent implements OnInit {

    public modal: NgbModalRef;
    public selectedItems: Task[] = [];
    public headers: PagingHeaders = new PagingHeaders();
    public searchOptions: TaskSearchOptions = new TaskSearchOptions();
    public tasks: Task[];
    public allSelected = false;

    @ViewChild('content') content: TemplateRef<unknown>;
    @Output() change: EventEmitter<Task> = new EventEmitter<Task>();
    @Output() changes: EventEmitter<Task[]> = new EventEmitter<Task[]>();
    @Input() canRemoveFilters = false;
    @Input() multiple = false;
    @Input() showAddNew = false;
    @Input() showFilters = true;
    @Input() showFooter = true;
    @Input() resetOnOpen = false;
    @Input() title = this.multiple ? "Select tasks" : "Select a task";
    @Input() milestone: Milestone;

    constructor(
        private modalService: NgbModal,
        private taskService: TaskService,
        private errorService: ErrorService
    ) {
    }

    ngOnInit(): void {
        this.searchOptions.includeParents = true;
    }

    open(): NgbModalRef {
        if (this.resetOnOpen) this.selectedItems = [];
        this.searchOptions.milestoneId = this.milestone?.milestoneId;
        this.modal = this.modalService.open(this.content, { size: 'xl', centered: true, scrollable: false });
        this.runSearch();
        this.modal.result.then((task: Task | Task[]) => {
            if (this.multiple) this.changes.emit(task as Task[]);
            else this.change.emit(task as Task);
        }, () => {
            // dismissed
        });
        return this.modal;
    }

    public runSearch(pageIndex = 0): Observable<TaskSearchResponse> {

        this.searchOptions.pageIndex = pageIndex;
        this.allSelected = false;

        const observable = this.taskService
            .search(this.searchOptions);

        observable.subscribe({
            next: response => {
                this.tasks = response.tasks;
                this.headers = response.headers;
            },
            error: err => {

                this.errorService.handleError(err, "Tasks", "Load");

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

    select(task: Task) {
        if (this.multiple) {
            if (this.isSelected(task)) {
                for (let i = 0; i < this.selectedItems.length; i++) {
                    if (this.selectedItems[i].taskId === task.taskId) {
                        this.selectedItems.splice(i, 1);
                        break;
                    }
                }
            } else {
                this.selectedItems.push(task);
            }
        } else {
            this.modal.close(task);
        }
    }

    isSelected(task: Task) {
        if (!this.multiple) return false;
        return this.selectedItems.filter(item => item.taskId === task.taskId).length > 0;
    }

    toggleAll() {
        this.allSelected = !this.allSelected;
        this.tasks.forEach(task => {
            const isSelected = this.isSelected(task);
			if (isSelected && !this.allSelected) {
                for (let i = 0; i < this.selectedItems.length; i++) {
                    if (this.selectedItems[i].taskId === task.taskId) {
                        this.selectedItems.splice(i, 1);
                        break;
                    }
                }
            } else if (!isSelected && this.allSelected) {
                this.selectedItems.push(task);
            }
        });
    }

    selectAll() {

        const oldPageSize = this.searchOptions.pageSize;
        this.searchOptions.pageSize = 0;
        this.searchOptions.pageIndex = 0;

        this.taskService.search(this.searchOptions)
            .subscribe({
                next: response => {
                    this.modal.close(response.tasks);
                    this.tasks = response.tasks;
                    this.searchOptions.pageSize = oldPageSize;
                },
                error: err => {
                    this.errorService.handleError(err, "Tasks", "Load");
                }
            });

    }

    addNew() {
        window.open("/tasks/add", "_blank");
    }
}
