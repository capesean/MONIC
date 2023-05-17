import { Component as NgComponent, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CdkDragDrop, CdkDragStart, moveItemInArray } from '@angular/cdk/drag-drop';
import { EntityTypeSearchOptions, EntityTypeSearchResponse, EntityType } from '../../common/models/entitytype.model';
import { EntityTypeService } from '../../common/services/entitytype.service';
import { PagingHeaders } from '../../common/models/http.model';
import { ErrorService } from '../../common/services/error.service';
import { ToastrService } from 'ngx-toastr';

@NgComponent({
    selector: 'entity-type-sort',
    templateUrl: './entitytype.sort.component.html'
})
export class EntityTypeSortComponent implements OnInit {

    public headers: PagingHeaders = new PagingHeaders();
    private bodyElement: HTMLElement = document.body;
    public entityTypes: EntityType[];

    constructor(
        public modal: NgbActiveModal,
        private entityTypeService: EntityTypeService,
        private errorService: ErrorService,
        private toastr: ToastrService
    ) {
    }

    ngOnInit(): void {
        this.entityTypeService.search({ pageSize: 0, includeParents: true } as EntityTypeSearchOptions)
            .subscribe({
                next: response => this.entityTypes = response.entityTypes,
                error: err => this.errorService.handleError(err, "EntityTypes", "Load")
            });
    }

    dragStart(event: CdkDragStart) {
        this.bodyElement.classList.add('inheritCursors');
        this.bodyElement.style.cursor = 'grabbing';
    }

    drop(event: CdkDragDrop<EntityType[]>) {
        this.bodyElement.classList.remove('inheritCursors');
        this.bodyElement.style.cursor = 'unset';
        moveItemInArray(this.entityTypes, event.previousIndex, event.currentIndex);
    }

    close() {
        this.entityTypeService.sort(this.entityTypes.map(o => o.entityTypeId))
            .subscribe({
                next: () => {
                    this.modal.close();
                    this.toastr.success("The sort order has been updated", "Change Sort Order");
                },
                error: err => {
                    this.errorService.handleError(err, "EntityTypes", "Sort");
                }
            });
    }

}

