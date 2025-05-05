import { Component as NgComponent, OnInit, ViewChild, Output, EventEmitter, TemplateRef, Input } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { RelationshipSearchOptions, RelationshipSearchResponse, Relationship } from '../../common/models/relationship.model';
import { RelationshipService } from '../../common/services/relationship.service';
import { PagingHeaders } from '../../common/models/http.model';
import { ErrorService } from '../../common/services/error.service';
import { TheoryOfChange } from '../../common/models/theoryofchange.model';
import { Component } from '../../common/models/component.model';

@NgComponent({
    selector: 'relationship-modal',
    templateUrl: './relationship.modal.component.html',
    standalone: false
})
export class RelationshipModalComponent implements OnInit {

    public modal: NgbModalRef;
    public selectedItems: Relationship[] = [];
    public headers: PagingHeaders = new PagingHeaders();
    public searchOptions: RelationshipSearchOptions = new RelationshipSearchOptions();
    public relationships: Relationship[];
    public allSelected = false;

    @ViewChild('content') content: TemplateRef<unknown>;
    @Output() change: EventEmitter<Relationship> = new EventEmitter<Relationship>();
    @Output() changes: EventEmitter<Relationship[]> = new EventEmitter<Relationship[]>();
    @Input() canRemoveFilters = false;
    @Input() multiple = false;
    @Input() showAddNew = false;
    @Input() showFilters = true;
    @Input() showFooter = true;
    @Input() resetOnOpen = false;
    @Input() title = this.multiple ? "Select relationships" : "Select a relationship";
    @Input() theoryOfChange: TheoryOfChange;
    @Input() sourceComponent: Component;
    @Input() targetComponent: Component;

    constructor(
        private modalService: NgbModal,
        private relationshipService: RelationshipService,
        private errorService: ErrorService
    ) {
    }

    ngOnInit(): void {
        this.searchOptions.includeParents = true;
    }

    open(): NgbModalRef {
        if (this.resetOnOpen) this.selectedItems = [];
        this.searchOptions.theoryOfChangeId = this.theoryOfChange?.theoryOfChangeId;
        this.searchOptions.sourceComponentId = this.sourceComponent?.componentId;
        this.searchOptions.targetComponentId = this.targetComponent?.componentId;
        this.modal = this.modalService.open(this.content, { size: 'xl', centered: true, scrollable: false });
        this.runSearch();
        this.modal.result.then((relationship: Relationship | Relationship[]) => {
            if (this.multiple) this.changes.emit(relationship as Relationship[]);
            else this.change.emit(relationship as Relationship);
        }, () => {
            // dismissed
        });
        return this.modal;
    }

    public runSearch(pageIndex = 0): Observable<RelationshipSearchResponse> {

        this.searchOptions.pageIndex = pageIndex;
        this.allSelected = false;

        const observable = this.relationshipService
            .search(this.searchOptions);

        observable.subscribe({
            next: response => {
                this.relationships = response.relationships;
                this.headers = response.headers;
            },
            error: err => {

                this.errorService.handleError(err, "Relationships", "Load");

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

    select(relationship: Relationship) {
        if (this.multiple) {
            if (this.isSelected(relationship)) {
                for (let i = 0; i < this.selectedItems.length; i++) {
                    if (this.selectedItems[i].relationshipId === relationship.relationshipId) {
                        this.selectedItems.splice(i, 1);
                        break;
                    }
                }
            } else {
                this.selectedItems.push(relationship);
            }
        } else {
            this.modal.close(relationship);
        }
    }

    isSelected(relationship: Relationship) {
        if (!this.multiple) return false;
        return this.selectedItems.filter(item => item.relationshipId === relationship.relationshipId).length > 0;
    }

    toggleAll() {
        this.allSelected = !this.allSelected;
        this.relationships.forEach(relationship => {
            const isSelected = this.isSelected(relationship);
			if (isSelected && !this.allSelected) {
                for (let i = 0; i < this.selectedItems.length; i++) {
                    if (this.selectedItems[i].relationshipId === relationship.relationshipId) {
                        this.selectedItems.splice(i, 1);
                        break;
                    }
                }
            } else if (!isSelected && this.allSelected) {
                this.selectedItems.push(relationship);
            }
        });
    }

    selectAll() {

        const oldPageSize = this.searchOptions.pageSize;
        this.searchOptions.pageSize = 0;
        this.searchOptions.pageIndex = 0;

        this.relationshipService.search(this.searchOptions)
            .subscribe({
                next: response => {
                    this.modal.close(response.relationships);
                    this.relationships = response.relationships;
                    this.searchOptions.pageSize = oldPageSize;
                },
                error: err => {
                    this.errorService.handleError(err, "Relationships", "Load");
                }
            });

    }

    addNew() {
        window.open("/relationships/add", "_blank");
    }
}
