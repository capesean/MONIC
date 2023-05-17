import { Component as NgComponent, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CdkDragDrop, CdkDragStart, moveItemInArray } from '@angular/cdk/drag-drop';
import { ComponentSearchOptions, ComponentSearchResponse, Component } from '../../common/models/component.model';
import { ComponentService } from '../../common/services/component.service';
import { PagingHeaders } from '../../common/models/http.model';
import { ErrorService } from '../../common/services/error.service';
import { ToastrService } from 'ngx-toastr';
import { Enum, Enums } from '../../common/models/enums.model';

@NgComponent({
    selector: 'component-sort',
    templateUrl: './component.sort.component.html'
})
export class ComponentSortComponent implements OnInit {

    public headers: PagingHeaders = new PagingHeaders();
    private bodyElement: HTMLElement = document.body;
    public components: Component[];
    public componentTypes: Enum[] = Enums.ComponentTypes;

    constructor(
        public modal: NgbActiveModal,
        private componentService: ComponentService,
        private errorService: ErrorService,
        private toastr: ToastrService
    ) {
    }

    ngOnInit(): void {
        this.componentService.search({ pageSize: 0, includeParents: true } as ComponentSearchOptions)
            .subscribe({
                next: response => this.components = response.components,
                error: err => this.errorService.handleError(err, "Components", "Load")
            });
    }

    dragStart(event: CdkDragStart) {
        this.bodyElement.classList.add('inheritCursors');
        this.bodyElement.style.cursor = 'grabbing';
    }

    drop(event: CdkDragDrop<Component[]>) {
        this.bodyElement.classList.remove('inheritCursors');
        this.bodyElement.style.cursor = 'unset';
        moveItemInArray(this.components, event.previousIndex, event.currentIndex);
    }

    close() {
        this.componentService.sort(this.components.map(o => o.componentId))
            .subscribe({
                next: () => {
                    this.modal.close();
                    this.toastr.success("The sort order has been updated", "Change Sort Order");
                },
                error: err => {
                    this.errorService.handleError(err, "Components", "Sort");
                }
            });
    }

}

