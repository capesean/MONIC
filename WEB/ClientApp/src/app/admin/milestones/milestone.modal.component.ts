import { Component as NgComponent, OnInit, ViewChild, Output, EventEmitter, TemplateRef, Input } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { MilestoneSearchOptions, MilestoneSearchResponse, Milestone } from '../../common/models/milestone.model';
import { MilestoneService } from '../../common/services/milestone.service';
import { PagingHeaders } from '../../common/models/http.model';
import { ErrorService } from '../../common/services/error.service';
import { Project } from '../../common/models/project.model';

@NgComponent({
    selector: 'milestone-modal',
    templateUrl: './milestone.modal.component.html',
    standalone: false
})
export class MilestoneModalComponent implements OnInit {

    public modal: NgbModalRef;
    public headers: PagingHeaders = new PagingHeaders();
    public searchOptions: MilestoneSearchOptions = new MilestoneSearchOptions();
    public milestones: Milestone[];
    public allSelected = false;

    @ViewChild('content') content: TemplateRef<unknown>;
    @Output() change: EventEmitter<Milestone> = new EventEmitter<Milestone>();
    @Output() changes: EventEmitter<Milestone[]> = new EventEmitter<Milestone[]>();
    @Input() selectedItems: Milestone[] = [];
    @Input() canRemoveFilters = false;
    @Input() multiple = false;
    @Input() showAddNew = false;
    @Input() showFilters = true;
    @Input() showFooter = true;
    @Input() resetOnOpen = false;
    @Input() title = this.multiple ? "Select milestones" : "Select a milestone";
    @Input() project: Project;

    constructor(
        private modalService: NgbModal,
        private milestoneService: MilestoneService,
        private errorService: ErrorService
    ) {
    }

    ngOnInit(): void {
        this.searchOptions.includeParents = true;
    }

    open(): NgbModalRef {
        if (this.resetOnOpen) this.selectedItems = [];
        this.searchOptions.projectId = this.project?.projectId;
        this.modal = this.modalService.open(this.content, { size: 'xl', centered: true, scrollable: false });
        this.runSearch();
        this.modal.result.then((milestone: Milestone | Milestone[]) => {
            if (this.multiple) this.changes.emit(milestone as Milestone[]);
            else this.change.emit(milestone as Milestone);
        }, () => {
            // dismissed
        });
        return this.modal;
    }

    public runSearch(pageIndex = 0): Observable<MilestoneSearchResponse> {

        this.searchOptions.pageIndex = pageIndex;
        this.allSelected = false;

        const observable = this.milestoneService
            .search(this.searchOptions);

        observable.subscribe({
            next: response => {
                this.milestones = response.milestones;
                this.headers = response.headers;
            },
            error: err => {

                this.errorService.handleError(err, "Milestones", "Load");

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

    select(milestone: Milestone) {
        if (this.multiple) {
            if (this.isSelected(milestone)) {
                for (let i = 0; i < this.selectedItems.length; i++) {
                    if (this.selectedItems[i].milestoneId === milestone.milestoneId) {
                        this.selectedItems.splice(i, 1);
                        break;
                    }
                }
            } else {
                this.selectedItems.push(milestone);
            }
        } else {
            this.modal.close(milestone);
        }
    }

    isSelected(milestone: Milestone) {
        if (!this.multiple) return false;
        return this.selectedItems.filter(item => item.milestoneId === milestone.milestoneId).length > 0;
    }

    toggleAll() {
        this.allSelected = !this.allSelected;
        this.milestones.forEach(milestone => {
            const isSelected = this.isSelected(milestone);
			if (isSelected && !this.allSelected) {
                for (let i = 0; i < this.selectedItems.length; i++) {
                    if (this.selectedItems[i].milestoneId === milestone.milestoneId) {
                        this.selectedItems.splice(i, 1);
                        break;
                    }
                }
            } else if (!isSelected && this.allSelected) {
                this.selectedItems.push(milestone);
            }
        });
    }

    selectAll() {

        const oldPageSize = this.searchOptions.pageSize;
        this.searchOptions.pageSize = 0;
        this.searchOptions.pageIndex = 0;

        this.milestoneService.search(this.searchOptions)
            .subscribe({
                next: response => {
                    this.modal.close(response.milestones);
                    this.milestones = response.milestones;
                    this.searchOptions.pageSize = oldPageSize;
                },
                error: err => {
                    this.errorService.handleError(err, "Milestones", "Load");
                }
            });

    }

    addNew() {
        window.open("/milestones/add", "_blank");
    }
}
