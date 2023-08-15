import { Component as NgComponent, OnInit, ViewChild, Output, EventEmitter, TemplateRef, Input } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { ResponseSearchOptions, ResponseSearchResponse, Response } from '../../common/models/response.model';
import { ResponseService } from '../../common/services/response.service';
import { PagingHeaders } from '../../common/models/http.model';
import { ErrorService } from '../../common/services/error.service';
import { Questionnaire } from '../../common/models/questionnaire.model';
import { Entity } from '../../common/models/entity.model';
import { Date } from '../../common/models/date.model';

@NgComponent({
    selector: 'response-modal',
    templateUrl: './response.modal.component.html'
})
export class ResponseModalComponent implements OnInit {

    public modal: NgbModalRef;
    public selectedItems: Response[] = [];
    public headers: PagingHeaders = new PagingHeaders();
    public searchOptions: ResponseSearchOptions = new ResponseSearchOptions();
    public responses: Response[];
    public allSelected = false;

    @ViewChild('content') content: TemplateRef<unknown>;
    @Output() change: EventEmitter<Response> = new EventEmitter<Response>();
    @Output() changes: EventEmitter<Response[]> = new EventEmitter<Response[]>();
    @Input() canRemoveFilters = false;
    @Input() multiple = false;
    @Input() showAddNew = false;
    @Input() title = this.multiple ? "Select responses" : "Select a response";
    @Input() questionnaire: Questionnaire;
    @Input() entity: Entity;
    @Input() date: Date;

    constructor(
        private modalService: NgbModal,
        private responseService: ResponseService,
        private errorService: ErrorService
    ) {
    }

    ngOnInit(): void {
        this.searchOptions.includeParents = true;
    }

    open(): NgbModalRef {
        this.searchOptions.questionnaireId = this.questionnaire?.questionnaireId;
        this.searchOptions.entityId = this.entity?.entityId;
        this.searchOptions.dateId = this.date?.dateId;
        this.modal = this.modalService.open(this.content, { size: 'xl', centered: true, scrollable: true });
        this.runSearch();
        this.modal.result.then((response: Response | Response[]) => {
            if (this.multiple) this.changes.emit(response as Response[]);
            else this.change.emit(response as Response);
        }, () => {
            // dismissed
        });
        return this.modal;
    }

    public runSearch(pageIndex = 0): Observable<ResponseSearchResponse> {

        this.searchOptions.pageIndex = pageIndex;
        this.allSelected = false;

        const observable = this.responseService
            .search(this.searchOptions);

        observable.subscribe({
            next: response => {
                this.responses = response.responses;
                this.headers = response.headers;
            },
            error: err => {

                this.errorService.handleError(err, "Responses", "Load");

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

    select(response: Response) {
        if (this.multiple) {
            if (this.isSelected(response)) {
                for (let i = 0; i < this.selectedItems.length; i++) {
                    if (this.selectedItems[i].responseId === response.responseId) {
                        this.selectedItems.splice(i, 1);
                        break;
                    }
                }
            } else {
                this.selectedItems.push(response);
            }
        } else {
            this.modal.close(response);
        }
    }

    isSelected(response: Response) {
        if (!this.multiple) return false;
        return this.selectedItems.filter(item => item.responseId === response.responseId).length > 0;
    }

    toggleAll() {
        this.allSelected = !this.allSelected;
        this.responses.forEach(response => {
            const isSelected = this.isSelected(response);
			if (isSelected && !this.allSelected) {
                for (let i = 0; i < this.selectedItems.length; i++) {
                    if (this.selectedItems[i].responseId === response.responseId) {
                        this.selectedItems.splice(i, 1);
                        break;
                    }
                }
            } else if (!isSelected && this.allSelected) {
                this.selectedItems.push(response);
            }
        });
    }

    selectAll() {

        const oldPageSize = this.searchOptions.pageSize;
        this.searchOptions.pageSize = 0;
        this.searchOptions.pageIndex = 0;

        this.responseService.search(this.searchOptions)
            .subscribe({
                next: response => {
                    this.modal.close(response.responses);
                    this.responses = response.responses;
                    this.searchOptions.pageSize = oldPageSize;
                },
                error: err => {
                    this.errorService.handleError(err, "Responses", "Load");
                }
            });

    }

    addNew() {
        window.open("/responses/add", "_blank");
    }
}
