import { Component as NgComponent, OnInit, ViewChild, Output, EventEmitter, TemplateRef, Input } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { EntityTypeSearchOptions, EntityTypeSearchResponse, EntityType } from '../../common/models/entitytype.model';
import { EntityTypeService } from '../../common/services/entitytype.service';
import { PagingHeaders } from '../../common/models/http.model';
import { ErrorService } from '../../common/services/error.service';

@NgComponent({
    selector: 'entity-type-modal',
    templateUrl: './entitytype.modal.component.html'
})
export class EntityTypeModalComponent implements OnInit {

    public modal: NgbModalRef;
    public selectedItems: EntityType[] = [];
    public headers: PagingHeaders = new PagingHeaders();
    public searchOptions: EntityTypeSearchOptions = new EntityTypeSearchOptions();
    public entityTypes: EntityType[];
    public allSelected = false;

    @ViewChild('content') content: TemplateRef<unknown>;
    @Output() change: EventEmitter<EntityType> = new EventEmitter<EntityType>();
    @Output() changes: EventEmitter<EntityType[]> = new EventEmitter<EntityType[]>();
    @Input() canRemoveFilters = false;
    @Input() multiple = false;
    @Input() showAddNew = false;
    @Input() showFilters = true;
    @Input() showFooter = true;
    @Input() resetOnOpen = false;
    @Input() title = this.multiple ? "Select entity types" : "Select an entity type";

    constructor(
        private modalService: NgbModal,
        private entityTypeService: EntityTypeService,
        private errorService: ErrorService
    ) {
    }

    ngOnInit(): void {
        this.searchOptions.includeParents = true;
    }

    open(): NgbModalRef {
        if (this.resetOnOpen) this.selectedItems = [];
        this.modal = this.modalService.open(this.content, { size: 'xl', centered: true, scrollable: true });
        this.runSearch();
        this.modal.result.then((entityType: EntityType | EntityType[]) => {
            if (this.multiple) this.changes.emit(entityType as EntityType[]);
            else this.change.emit(entityType as EntityType);
        }, () => {
            // dismissed
        });
        return this.modal;
    }

    public runSearch(pageIndex = 0): Observable<EntityTypeSearchResponse> {

        this.searchOptions.pageIndex = pageIndex;
        this.allSelected = false;

        const observable = this.entityTypeService
            .search(this.searchOptions);

        observable.subscribe({
            next: response => {
                this.entityTypes = response.entityTypes;
                this.headers = response.headers;
            },
            error: err => {

                this.errorService.handleError(err, "Entity Types", "Load");

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

    select(entityType: EntityType) {
        if (this.multiple) {
            if (this.isSelected(entityType)) {
                for (let i = 0; i < this.selectedItems.length; i++) {
                    if (this.selectedItems[i].entityTypeId === entityType.entityTypeId) {
                        this.selectedItems.splice(i, 1);
                        break;
                    }
                }
            } else {
                this.selectedItems.push(entityType);
            }
        } else {
            this.modal.close(entityType);
        }
    }

    isSelected(entityType: EntityType) {
        if (!this.multiple) return false;
        return this.selectedItems.filter(item => item.entityTypeId === entityType.entityTypeId).length > 0;
    }

    toggleAll() {
        this.allSelected = !this.allSelected;
        this.entityTypes.forEach(entityType => {
            const isSelected = this.isSelected(entityType);
			if (isSelected && !this.allSelected) {
                for (let i = 0; i < this.selectedItems.length; i++) {
                    if (this.selectedItems[i].entityTypeId === entityType.entityTypeId) {
                        this.selectedItems.splice(i, 1);
                        break;
                    }
                }
            } else if (!isSelected && this.allSelected) {
                this.selectedItems.push(entityType);
            }
        });
    }

    selectAll() {

        const oldPageSize = this.searchOptions.pageSize;
        this.searchOptions.pageSize = 0;
        this.searchOptions.pageIndex = 0;

        this.entityTypeService.search(this.searchOptions)
            .subscribe({
                next: response => {
                    this.modal.close(response.entityTypes);
                    this.entityTypes = response.entityTypes;
                    this.searchOptions.pageSize = oldPageSize;
                },
                error: err => {
                    this.errorService.handleError(err, "Entity Types", "Load");
                }
            });

    }

    addNew() {
        window.open("/entitytypes/add", "_blank");
    }
}
