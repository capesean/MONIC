import { Component as NgComponent, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CdkDragDrop, CdkDragStart, moveItemInArray } from '@angular/cdk/drag-drop';
import { DateSearchOptions, DateSearchResponse, AppDate } from '../../common/models/date.model';
import { DateService } from '../../common/services/date.service';
import { PagingHeaders } from '../../common/models/http.model';
import { ErrorService } from '../../common/services/error.service';
import { ToastrService } from 'ngx-toastr';
import { Enum, Enums } from '../../common/models/enums.model';

@NgComponent({
    selector: 'date-sort',
    templateUrl: './date.sort.component.html',
    standalone: false
})
export class DateSortComponent implements OnInit {

    public headers: PagingHeaders = new PagingHeaders();
    private bodyElement: HTMLElement = document.body;
    public dates: AppDate[];
    public dateTypes: Enum[] = Enums.DateTypes;

    constructor(
        public modal: NgbActiveModal,
        private dateService: DateService,
        private errorService: ErrorService,
        private toastr: ToastrService
    ) {
    }

    ngOnInit(): void {
        this.dateService.search({ pageSize: 0, includeParents: true } as DateSearchOptions)
            .subscribe({
                next: response => this.dates = response.dates,
                error: err => this.errorService.handleError(err, "Dates", "Load")
            });
    }

    dragStart(event: CdkDragStart) {
        this.bodyElement.classList.add('inheritCursors');
        this.bodyElement.style.cursor = 'grabbing';
    }

    drop(event: CdkDragDrop<Date[]>) {
        this.bodyElement.classList.remove('inheritCursors');
        this.bodyElement.style.cursor = 'unset';
        moveItemInArray(this.dates, event.previousIndex, event.currentIndex);
    }

    close() {
        this.dateService.sort(this.dates.map(o => o.dateId))
            .subscribe({
                next: () => {
                    this.modal.close();
                    this.toastr.success("The sort order has been updated", "Change Sort Order");
                },
                error: err => {
                    this.errorService.handleError(err, "Dates", "Sort");
                }
            });
    }

}

