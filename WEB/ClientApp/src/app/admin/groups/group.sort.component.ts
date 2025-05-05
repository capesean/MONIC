import { Component as NgComponent, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CdkDragDrop, CdkDragStart, moveItemInArray } from '@angular/cdk/drag-drop';
import { GroupSearchOptions, GroupSearchResponse, Group } from '../../common/models/group.model';
import { GroupService } from '../../common/services/group.service';
import { PagingHeaders } from '../../common/models/http.model';
import { ErrorService } from '../../common/services/error.service';
import { ToastrService } from 'ngx-toastr';

@NgComponent({
    selector: 'group-sort',
    templateUrl: './group.sort.component.html',
    standalone: false
})
export class GroupSortComponent implements OnInit {

    public headers: PagingHeaders = new PagingHeaders();
    private bodyElement: HTMLElement = document.body;
    public groups: Group[];

    constructor(
        public modal: NgbActiveModal,
        private groupService: GroupService,
        private errorService: ErrorService,
        private toastr: ToastrService
    ) {
    }

    ngOnInit(): void {
        this.groupService.search({ pageSize: 0, includeParents: true } as GroupSearchOptions)
            .subscribe({
                next: response => this.groups = response.groups,
                error: err => this.errorService.handleError(err, "Groups", "Load")
            });
    }

    dragStart(event: CdkDragStart) {
        this.bodyElement.classList.add('inheritCursors');
        this.bodyElement.style.cursor = 'grabbing';
    }

    drop(event: CdkDragDrop<Group[]>) {
        this.bodyElement.classList.remove('inheritCursors');
        this.bodyElement.style.cursor = 'unset';
        moveItemInArray(this.groups, event.previousIndex, event.currentIndex);
    }

    close() {
        this.groupService.sort(this.groups.map(o => o.groupId))
            .subscribe({
                next: () => {
                    this.modal.close();
                    this.toastr.success("The sort order has been updated", "Change Sort Order");
                },
                error: err => {
                    this.errorService.handleError(err, "Groups", "Sort");
                }
            });
    }

}

