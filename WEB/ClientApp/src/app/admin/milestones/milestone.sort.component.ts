import { Component as NgComponent, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CdkDragDrop, CdkDragStart, moveItemInArray } from '@angular/cdk/drag-drop';
import { MilestoneSearchOptions, MilestoneSearchResponse, Milestone } from '../../common/models/milestone.model';
import { MilestoneService } from '../../common/services/milestone.service';
import { PagingHeaders } from '../../common/models/http.model';
import { ErrorService } from '../../common/services/error.service';
import { ToastrService } from 'ngx-toastr';

@NgComponent({
    selector: 'milestone-sort',
    templateUrl: './milestone.sort.component.html',
    standalone: false
})
export class MilestoneSortComponent implements OnInit {

    public headers: PagingHeaders = new PagingHeaders();
    private bodyElement: HTMLElement = document.body;
    public milestones: Milestone[];
    public projectId: string;

    constructor(
        public modal: NgbActiveModal,
        private milestoneService: MilestoneService,
        private errorService: ErrorService,
        private toastr: ToastrService
    ) {
    }

    ngOnInit(): void {
        this.milestoneService.search({ projectId: this.projectId, pageSize: 0, includeParents: true } as MilestoneSearchOptions)
            .subscribe({
                next: response => this.milestones = response.milestones,
                error: err => this.errorService.handleError(err, "Milestones", "Load")
            });
    }

    dragStart(event: CdkDragStart) {
        this.bodyElement.classList.add('inheritCursors');
        this.bodyElement.style.cursor = 'grabbing';
    }

    drop(event: CdkDragDrop<Milestone[]>) {
        this.bodyElement.classList.remove('inheritCursors');
        this.bodyElement.style.cursor = 'unset';
        moveItemInArray(this.milestones, event.previousIndex, event.currentIndex);
    }

    close() {
        this.milestoneService.sort(this.projectId, this.milestones.map(o => o.milestoneId))
            .subscribe({
                next: () => {
                    this.modal.close();
                    this.toastr.success("The sort order has been updated", "Change Sort Order");
                },
                error: err => {
                    this.errorService.handleError(err, "Milestones", "Sort");
                }
            });
    }

}

