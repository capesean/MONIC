import { Component as NgComponent, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CdkDragDrop, CdkDragStart, moveItemInArray } from '@angular/cdk/drag-drop';
import { OptionSearchOptions, OptionSearchResponse, Option } from '../../common/models/option.model';
import { OptionService } from '../../common/services/option.service';
import { PagingHeaders } from '../../common/models/http.model';
import { ErrorService } from '../../common/services/error.service';
import { ToastrService } from 'ngx-toastr';

@NgComponent({
    selector: 'option-sort',
    templateUrl: './option.sort.component.html',
    standalone: false
})
export class OptionSortComponent implements OnInit {

    public headers: PagingHeaders = new PagingHeaders();
    private bodyElement: HTMLElement = document.body;
    public options: Option[];
    public optionListId: string;

    constructor(
        public modal: NgbActiveModal,
        private optionService: OptionService,
        private errorService: ErrorService,
        private toastr: ToastrService
    ) {
    }

    ngOnInit(): void {
        this.optionService.search({ optionListId: this.optionListId, pageSize: 0, includeParents: true } as OptionSearchOptions)
            .subscribe({
                next: response => this.options = response.options,
                error: err => this.errorService.handleError(err, "Options", "Load")
            });
    }

    dragStart(event: CdkDragStart) {
        this.bodyElement.classList.add('inheritCursors');
        this.bodyElement.style.cursor = 'grabbing';
    }

    drop(event: CdkDragDrop<Option[]>) {
        this.bodyElement.classList.remove('inheritCursors');
        this.bodyElement.style.cursor = 'unset';
        moveItemInArray(this.options, event.previousIndex, event.currentIndex);
    }

    close() {
        this.optionService.sort(this.optionListId, this.options.map(o => o.optionId))
            .subscribe({
                next: () => {
                    this.modal.close();
                    this.toastr.success("The sort order has been updated", "Change Sort Order");
                },
                error: err => {
                    this.errorService.handleError(err, "Options", "Sort");
                }
            });
    }

}

