import { Component as NgComponent, OnInit, ViewChild, Output, EventEmitter, TemplateRef, Input } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { OrganisationSearchOptions, OrganisationSearchResponse, Organisation } from '../../common/models/organisation.model';
import { OrganisationService } from '../../common/services/organisation.service';
import { PagingHeaders } from '../../common/models/http.model';
import { ErrorService } from '../../common/services/error.service';

@NgComponent({
    selector: 'organisation-modal',
    templateUrl: './organisation.modal.component.html'
})
export class OrganisationModalComponent implements OnInit {

    public modal: NgbModalRef;
    public selectedItems: Organisation[] = [];
    public headers: PagingHeaders = new PagingHeaders();
    public searchOptions: OrganisationSearchOptions = new OrganisationSearchOptions();
    public organisations: Organisation[];
    public allSelected = false;

    @ViewChild('content') content: TemplateRef<unknown>;
    @Output() change: EventEmitter<Organisation> = new EventEmitter<Organisation>();
    @Output() changes: EventEmitter<Organisation[]> = new EventEmitter<Organisation[]>();
    @Input() canRemoveFilters = false;
    @Input() multiple = false;
    @Input() showAddNew = false;
    @Input() title = this.multiple ? "Select organisations" : "Select an organisation";

    constructor(
        private modalService: NgbModal,
        private organisationService: OrganisationService,
        private errorService: ErrorService
    ) {
    }

    ngOnInit(): void {
        this.searchOptions.includeParents = true;
    }

    open(): NgbModalRef {
        this.modal = this.modalService.open(this.content, { size: 'xl', centered: true, scrollable: true });
        this.runSearch();
        this.modal.result.then((organisation: Organisation | Organisation[]) => {
            if (this.multiple) this.changes.emit(organisation as Organisation[]);
            else this.change.emit(organisation as Organisation);
        }, () => {
            // dismissed
        });
        return this.modal;
    }

    public runSearch(pageIndex = 0): Observable<OrganisationSearchResponse> {

        this.searchOptions.pageIndex = pageIndex;

        const observable = this.organisationService
            .search(this.searchOptions);

        observable.subscribe({
            next: response => {
                this.organisations = response.organisations;
                this.headers = response.headers;
            },
            error: err => {

                this.errorService.handleError(err, "Organisations", "Load");

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

    select(organisation: Organisation) {
        if (this.multiple) {
            if (this.isSelected(organisation)) {
                for (let i = 0; i < this.selectedItems.length; i++) {
                    if (this.selectedItems[i].organisationId === organisation.organisationId) {
                        this.selectedItems.splice(i, 1);
                        break;
                    }
                }
            } else {
                this.selectedItems.push(organisation);
            }
        } else {
            this.modal.close(organisation);
        }
    }

    isSelected(organisation: Organisation) {
        if (!this.multiple) return false;
        return this.selectedItems.filter(item => item.organisationId === organisation.organisationId).length > 0;
    }

    toggleAll() {
        this.allSelected = !this.allSelected;
        this.organisations.forEach(organisation => {
            const isSelected = this.isSelected(organisation);
			if (isSelected && !this.allSelected) {
                for (let i = 0; i < this.selectedItems.length; i++) {
                    if (this.selectedItems[i].organisationId === organisation.organisationId) {
                        this.selectedItems.splice(i, 1);
                        break;
                    }
                }
            } else if (!isSelected && this.allSelected) {
                this.selectedItems.push(organisation);
            }
        });
    }

    selectAll() {

        const oldPageSize = this.searchOptions.pageSize;
        this.searchOptions.pageSize = 0;
        this.searchOptions.pageIndex = 0;

        this.organisationService.search(this.searchOptions)
            .subscribe({
                next: response => {
                    this.modal.close(response.organisations);
                    this.organisations = response.organisations;
                    this.searchOptions.pageSize = oldPageSize;
                },
                error: err => {
                    this.errorService.handleError(err, "Organisations", "Load");
                }
            });

    }

    addNew() {
        window.open("/organisations/add", "_blank");
    }
}
