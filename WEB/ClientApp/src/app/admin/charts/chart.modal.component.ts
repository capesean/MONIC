import { Component as NgComponent, OnInit, ViewChild, Output, EventEmitter, TemplateRef, Input } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { ChartSearchOptions, ChartSearchResponse, Chart } from '../../common/models/chart.model';
import { ChartService } from '../../common/services/chart.service';
import { PagingHeaders } from '../../common/models/http.model';
import { ErrorService } from '../../common/services/error.service';

@NgComponent({
    selector: 'chart-modal',
    templateUrl: './chart.modal.component.html',
    standalone: false
})
export class ChartModalComponent implements OnInit {

    public modal: NgbModalRef;
    public headers: PagingHeaders = new PagingHeaders();
    public searchOptions: ChartSearchOptions = new ChartSearchOptions();
    public charts: Chart[];
    public allSelected = false;

    @ViewChild('content') content: TemplateRef<unknown>;
    @Output() change: EventEmitter<Chart> = new EventEmitter<Chart>();
    @Output() changes: EventEmitter<Chart[]> = new EventEmitter<Chart[]>();
    @Input() selectedItems: Chart[] = [];
    @Input() canRemoveFilters = false;
    @Input() multiple = false;
    @Input() showAddNew = false;
    @Input() showFilters = true;
    @Input() showFooter = true;
    @Input() resetOnOpen = false;
    @Input() title = this.multiple ? "Select charts" : "Select a chart";

    constructor(
        private modalService: NgbModal,
        private chartService: ChartService,
        private errorService: ErrorService
    ) {
    }

    ngOnInit(): void {
        this.searchOptions.includeParents = true;
    }

    open(): NgbModalRef {
        if (this.resetOnOpen) this.selectedItems = [];
        this.modal = this.modalService.open(this.content, { size: 'xl', centered: true, scrollable: false });
        this.runSearch();
        this.modal.result.then((chart: Chart | Chart[]) => {
            if (this.multiple) this.changes.emit(chart as Chart[]);
            else this.change.emit(chart as Chart);
        }, () => {
            // dismissed
        });
        return this.modal;
    }

    public runSearch(pageIndex = 0): Observable<ChartSearchResponse> {

        this.searchOptions.pageIndex = pageIndex;
        this.allSelected = false;

        const observable = this.chartService
            .search(this.searchOptions);

        observable.subscribe({
            next: response => {
                this.charts = response.charts;
                this.headers = response.headers;
            },
            error: err => {

                this.errorService.handleError(err, "Charts", "Load");

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

    select(chart: Chart) {
        if (this.multiple) {
            if (this.isSelected(chart)) {
                for (let i = 0; i < this.selectedItems.length; i++) {
                    if (this.selectedItems[i].chartId === chart.chartId) {
                        this.selectedItems.splice(i, 1);
                        break;
                    }
                }
            } else {
                this.selectedItems.push(chart);
            }
        } else {
            this.modal.close(chart);
        }
    }

    isSelected(chart: Chart) {
        if (!this.multiple) return false;
        return this.selectedItems.filter(item => item.chartId === chart.chartId).length > 0;
    }

    toggleAll() {
        this.allSelected = !this.allSelected;
        this.charts.forEach(chart => {
            const isSelected = this.isSelected(chart);
			if (isSelected && !this.allSelected) {
                for (let i = 0; i < this.selectedItems.length; i++) {
                    if (this.selectedItems[i].chartId === chart.chartId) {
                        this.selectedItems.splice(i, 1);
                        break;
                    }
                }
            } else if (!isSelected && this.allSelected) {
                this.selectedItems.push(chart);
            }
        });
    }

    selectAll() {

        const oldPageSize = this.searchOptions.pageSize;
        this.searchOptions.pageSize = 0;
        this.searchOptions.pageIndex = 0;

        this.chartService.search(this.searchOptions)
            .subscribe({
                next: response => {
                    this.modal.close(response.charts);
                    this.charts = response.charts;
                    this.searchOptions.pageSize = oldPageSize;
                },
                error: err => {
                    this.errorService.handleError(err, "Charts", "Load");
                }
            });

    }

    addNew() {
        window.open("/charts/add", "_blank");
    }
}
