import { Component as NgComponent, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CdkDragDrop, CdkDragStart, moveItemInArray } from '@angular/cdk/drag-drop';
import { LogFrameRowSearchOptions, LogFrameRowSearchResponse, LogFrameRow } from '../../common/models/logframerow.model';
import { LogFrameRowService } from '../../common/services/logframerow.service';
import { PagingHeaders } from '../../common/models/http.model';
import { ErrorService } from '../../common/services/error.service';
import { ToastrService } from 'ngx-toastr';
import { Enum, Enums } from '../../common/models/enums.model';

@NgComponent({
    selector: 'log-frame-row-sort',
    templateUrl: './logframerow.sort.component.html'
})
export class LogFrameRowSortComponent implements OnInit {

    public headers: PagingHeaders = new PagingHeaders();
    private bodyElement: HTMLElement = document.body;
    public logFrameRows: LogFrameRow[];
    public logFrameRowTypes: Enum[] = Enums.LogFrameRowTypes;
    public logFrameId: string;

    constructor(
        public modal: NgbActiveModal,
        private logFrameRowService: LogFrameRowService,
        private errorService: ErrorService,
        private toastr: ToastrService
    ) {
    }

    ngOnInit(): void {
        this.logFrameRowService.search({ logFrameId: this.logFrameId, pageSize: 0, includeParents: true } as LogFrameRowSearchOptions)
            .subscribe({
                next: response => this.logFrameRows = response.logFrameRows,
                error: err => this.errorService.handleError(err, "LogFrameRows", "Load")
            });
    }

    dragStart(event: CdkDragStart) {
        this.bodyElement.classList.add('inheritCursors');
        this.bodyElement.style.cursor = 'grabbing';
    }

    drop(event: CdkDragDrop<LogFrameRow[]>) {
        this.bodyElement.classList.remove('inheritCursors');
        this.bodyElement.style.cursor = 'unset';
        moveItemInArray(this.logFrameRows, event.previousIndex, event.currentIndex);
    }

    close() {
        this.logFrameRowService.sort(this.logFrameId, this.logFrameRows.map(o => o.logFrameRowId))
            .subscribe({
                next: () => {
                    this.modal.close();
                    this.toastr.success("The sort order has been updated", "Change Sort Order");
                },
                error: err => {
                    this.errorService.handleError(err, "LogFrameRows", "Sort");
                }
            });
    }

}

