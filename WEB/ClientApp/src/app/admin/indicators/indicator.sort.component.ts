import { Component as NgComponent, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { IndicatorSearchOptions, IndicatorSearchResponse, Indicator } from '../../common/models/indicator.model';
import { IndicatorService } from '../../common/services/indicator.service';
import { PagingHeaders } from '../../common/models/http.model';
import { ErrorService } from '../../common/services/error.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ToastrService } from 'ngx-toastr';
import { Enum, Enums } from '../../common/models/enums.model';

@NgComponent({
    selector: 'indicator-sort',
    templateUrl: './indicator.sort.component.html'
})
export class IndicatorSortComponent implements OnInit {

    public headers: PagingHeaders = new PagingHeaders();
    public indicators: Indicator[];
    public indicatorStatuses: Enum[] = Enums.IndicatorStatuses;
    public dateTypes: Enum[] = Enums.DateTypes;
    public indicatorTypes: Enum[] = Enums.IndicatorTypes;
    public subcategoryId: string;

    constructor(
        public modal: NgbActiveModal,
        private indicatorService: IndicatorService,
        private errorService: ErrorService,
        private toastr: ToastrService
    ) {
    }

    ngOnInit(): void {
        this.indicatorService.search({ subcategoryId: this.subcategoryId, pageSize: 0, includeParents: true } as IndicatorSearchOptions)
            .subscribe({
                next: response => this.indicators = response.indicators,
                error: err => this.errorService.handleError(err, "Indicators", "Load")
            });
    }

    drop(event: CdkDragDrop<Indicator[]>) {
        moveItemInArray(this.indicators, event.previousIndex, event.currentIndex);
    }

    close() {
        this.indicatorService.sort(this.subcategoryId, this.indicators.map(o => o.indicatorId))
            .subscribe({
                next: () => {
                    this.modal.close();
                    this.toastr.success("The sort order has been updated", "Change Sort Order");
                },
                error: err => {
                    this.errorService.handleError(err, "Indicators", "Sort");
                }
            });
    }

}

