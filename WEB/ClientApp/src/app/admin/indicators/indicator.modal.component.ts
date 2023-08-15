import { Component as NgComponent, OnInit, ViewChild, Output, EventEmitter, TemplateRef, Input } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { IndicatorSearchOptions, IndicatorSearchResponse, Indicator } from '../../common/models/indicator.model';
import { IndicatorService } from '../../common/services/indicator.service';
import { PagingHeaders } from '../../common/models/http.model';
import { ErrorService } from '../../common/services/error.service';
import { Enum, Enums } from '../../common/models/enums.model';
import { Subcategory } from '../../common/models/subcategory.model';
import { EntityType } from '../../common/models/entitytype.model';
import { User } from '../../common/models/user.model';
import { Category } from '../../common/models/category.model';

@NgComponent({
    selector: 'indicator-modal',
    templateUrl: './indicator.modal.component.html'
})
export class IndicatorModalComponent implements OnInit {

    public modal: NgbModalRef;
    public selectedItems: Indicator[] = [];
    public headers: PagingHeaders = new PagingHeaders();
    public searchOptions: IndicatorSearchOptions = new IndicatorSearchOptions();
    public indicators: Indicator[];
    public allSelected = false;
    dateTypes = Enums.DateTypes;
    indicatorStatuses = Enums.IndicatorStatuses;
    indicatorTypes = Enums.IndicatorTypes;

    @ViewChild('content') content: TemplateRef<unknown>;
    @Output() change: EventEmitter<Indicator> = new EventEmitter<Indicator>();
    @Output() changes: EventEmitter<Indicator[]> = new EventEmitter<Indicator[]>();
    @Input() canRemoveFilters = false;
    @Input() multiple = false;
    @Input() showAddNew = false;
    @Input() title = this.multiple ? "Select indicators" : "Select an indicator";
    @Input() category: Category;
    @Input() subcategory: Subcategory;
    @Input() indicatorType: Enum;
    @Input() indicatorStatus: Enum;
    @Input() entityType: EntityType;
    @Input() frequency: Enum;
    @Input() createdBy: User;
    @Input() showClear = true;

    constructor(
        private modalService: NgbModal,
        private indicatorService: IndicatorService,
        private errorService: ErrorService
    ) {
    }

    ngOnInit(): void {
        this.searchOptions.includeParents = true;
    }

    open(): NgbModalRef {
        this.searchOptions.categoryId = this.category ? this.category.categoryId : undefined;
        this.searchOptions.subcategoryId = this.subcategory?.subcategoryId;
        this.searchOptions.indicatorType = this.indicatorType?.value;
        this.searchOptions.indicatorStatus = this.indicatorStatus?.value;
        this.searchOptions.entityTypeId = this.entityType?.entityTypeId;
        this.searchOptions.frequency = this.frequency?.value;
        this.searchOptions.createdById = this.createdBy?.id;
        this.modal = this.modalService.open(this.content, { size: 'xl', centered: true, scrollable: true });
        this.runSearch();
        this.modal.result.then((indicator: Indicator | Indicator[]) => {
            if (this.multiple) this.changes.emit(indicator as Indicator[]);
            else this.change.emit(indicator as Indicator);
        }, () => {
            // dismissed
        });
        return this.modal;
    }

    public runSearch(pageIndex = 0): Observable<IndicatorSearchResponse> {

        this.searchOptions.pageIndex = pageIndex;
        this.allSelected = false;

        const observable = this.indicatorService
            .search(this.searchOptions);

        observable.subscribe({
            next: response => {
                this.indicators = response.indicators;
                this.headers = response.headers;
            },
            error: err => {

                this.errorService.handleError(err, "Indicators", "Load");

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

    select(indicator: Indicator) {
        if (this.multiple) {
            if (this.isSelected(indicator)) {
                for (let i = 0; i < this.selectedItems.length; i++) {
                    if (this.selectedItems[i].indicatorId === indicator.indicatorId) {
                        this.selectedItems.splice(i, 1);
                        break;
                    }
                }
            } else {
                this.selectedItems.push(indicator);
            }
        } else {
            this.modal.close(indicator);
        }
    }

    isSelected(indicator: Indicator) {
        if (!this.multiple) return false;
        return this.selectedItems.filter(item => item.indicatorId === indicator.indicatorId).length > 0;
    }

    toggleAll() {
        this.allSelected = !this.allSelected;
        this.indicators.forEach(indicator => {
            const isSelected = this.isSelected(indicator);
			if (isSelected && !this.allSelected) {
                for (let i = 0; i < this.selectedItems.length; i++) {
                    if (this.selectedItems[i].indicatorId === indicator.indicatorId) {
                        this.selectedItems.splice(i, 1);
                        break;
                    }
                }
            } else if (!isSelected && this.allSelected) {
                this.selectedItems.push(indicator);
            }
        });
    }

    selectAll() {

        const oldPageSize = this.searchOptions.pageSize;
        this.searchOptions.pageSize = 0;
        this.searchOptions.pageIndex = 0;

        this.indicatorService.search(this.searchOptions)
            .subscribe({
                next: response => {
                    this.modal.close(response.indicators);
                    this.indicators = response.indicators;
                    this.searchOptions.pageSize = oldPageSize;
                },
                error: err => {
                    this.errorService.handleError(err, "Indicators", "Load");
                }
            });

    }

    addNew() {
        window.open("/indicators/add", "_blank");
    }
}
