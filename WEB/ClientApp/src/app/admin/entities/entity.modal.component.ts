import { Component as NgComponent, OnInit, ViewChild, Output, EventEmitter, TemplateRef, Input } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { EntitySearchOptions, EntitySearchResponse, Entity } from '../../common/models/entity.model';
import { EntityService } from '../../common/services/entity.service';
import { PagingHeaders } from '../../common/models/http.model';
import { ErrorService } from '../../common/services/error.service';
import { EntityType } from '../../common/models/entitytype.model';
import { Organisation } from '../../common/models/organisation.model';
import { Roles } from '../../common/models/enums.model';

@NgComponent({
    selector: 'entity-modal',
    templateUrl: './entity.modal.component.html'
})
export class EntityModalComponent implements OnInit {

    public modal: NgbModalRef;
    public selectedItems: Entity[] = [];
    public headers: PagingHeaders = new PagingHeaders();
    public searchOptions: EntitySearchOptions = new EntitySearchOptions();
    public entities: Entity[];
    public allSelected = false;

    @ViewChild('content') content: TemplateRef<unknown>;
    @Output() change: EventEmitter<Entity> = new EventEmitter<Entity>();
    @Output() changes: EventEmitter<Entity[]> = new EventEmitter<Entity[]>();
    @Input() canRemoveFilters = false;
    @Input() multiple = false;
    @Input() showAddNew = false;
    @Input() showFooter = true;
    @Input() resetOnOpen = false;
    @Input() title = this.multiple ? "Select entities" : "Select an entity";
    @Input() entityType: EntityType;
    @Input() organisation: Organisation;
    @Input() disabled: boolean;
    @Input() permission: string;
    @Input() role: Roles;

    constructor(
        private modalService: NgbModal,
        private entityService: EntityService,
        private errorService: ErrorService
    ) {
    }

    ngOnInit(): void {
        this.searchOptions.includeParents = true;
    }

    open(): NgbModalRef {
        if (this.resetOnOpen) this.selectedItems = [];
        this.searchOptions.entityTypeId = this.entityType?.entityTypeId;
        this.searchOptions.organisationId = this.organisation?.organisationId;
        this.searchOptions.permission = this.permission;
        this.searchOptions.role = this.role;
        this.searchOptions.disabled = this.disabled;
        if (this.title === "Select a parent entity") this.searchOptions.isParent = true;
        this.searchOptions.disabled = this.disabled;
        this.modal = this.modalService.open(this.content, { size: 'xl', centered: true, scrollable: true });
        this.runSearch();
        this.modal.result.then((entity: Entity | Entity[]) => {
            if (this.multiple) this.changes.emit(entity as Entity[]);
            else this.change.emit(entity as Entity);
        }, () => {
            // dismissed
        });
        return this.modal;
    }

    public runSearch(pageIndex = 0): Observable<EntitySearchResponse> {

        this.searchOptions.pageIndex = pageIndex;
        this.allSelected = false;

        const observable = this.entityService
            .search(this.searchOptions);

        observable.subscribe({
            next: response => {
                this.entities = response.entities;
                this.headers = response.headers;
            },
            error: err => {

                this.errorService.handleError(err, "Entities", "Load");

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

    select(entity: Entity) {
        if (this.multiple) {
            if (this.isSelected(entity)) {
                for (let i = 0; i < this.selectedItems.length; i++) {
                    if (this.selectedItems[i].entityId === entity.entityId) {
                        this.selectedItems.splice(i, 1);
                        break;
                    }
                }
            } else {
                this.selectedItems.push(entity);
            }
        } else {
            this.modal.close(entity);
        }
    }

    isSelected(entity: Entity) {
        if (!this.multiple) return false;
        return this.selectedItems.filter(item => item.entityId === entity.entityId).length > 0;
    }

    toggleAll() {
        this.allSelected = !this.allSelected;
        this.entities.forEach(entity => {
            const isSelected = this.isSelected(entity);
			if (isSelected && !this.allSelected) {
                for (let i = 0; i < this.selectedItems.length; i++) {
                    if (this.selectedItems[i].entityId === entity.entityId) {
                        this.selectedItems.splice(i, 1);
                        break;
                    }
                }
            } else if (!isSelected && this.allSelected) {
                this.selectedItems.push(entity);
            }
        });
    }

    selectAll() {

        const oldPageSize = this.searchOptions.pageSize;
        this.searchOptions.pageSize = 0;
        this.searchOptions.pageIndex = 0;

        this.entityService.search(this.searchOptions)
            .subscribe({
                next: response => {
                    this.modal.close(response.entities);
                    this.entities = response.entities;
                    this.searchOptions.pageSize = oldPageSize;
                },
                error: err => {
                    this.errorService.handleError(err, "Entities", "Load");
                }
            });

    }

    addNew() {
        window.open("/entities/add", "_blank");
    }
}
