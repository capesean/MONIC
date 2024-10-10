import { Component as NgComponent, OnInit, ViewChild, Output, EventEmitter, TemplateRef, Input } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { GroupSearchOptions, GroupSearchResponse, Group } from '../../common/models/group.model';
import { GroupService } from '../../common/services/group.service';
import { PagingHeaders } from '../../common/models/http.model';
import { ErrorService } from '../../common/services/error.service';

@NgComponent({
    selector: 'group-modal',
    templateUrl: './group.modal.component.html'
})
export class GroupModalComponent implements OnInit {

    public modal: NgbModalRef;
    public selectedItems: Group[] = [];
    public headers: PagingHeaders = new PagingHeaders();
    public searchOptions: GroupSearchOptions = new GroupSearchOptions();
    public groups: Group[];
    public allSelected = false;

    @ViewChild('content') content: TemplateRef<unknown>;
    @Output() change: EventEmitter<Group> = new EventEmitter<Group>();
    @Output() changes: EventEmitter<Group[]> = new EventEmitter<Group[]>();
    @Input() canRemoveFilters = false;
    @Input() multiple = false;
    @Input() showAddNew = false;
    @Input() showFilters = true;
    @Input() showFooter = true;
    @Input() resetOnOpen = false;
    @Input() title = this.multiple ? "Select groups" : "Select a group";

    constructor(
        private modalService: NgbModal,
        private groupService: GroupService,
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
        this.modal.result.then((group: Group | Group[]) => {
            if (this.multiple) this.changes.emit(group as Group[]);
            else this.change.emit(group as Group);
        }, () => {
            // dismissed
        });
        return this.modal;
    }

    public runSearch(pageIndex = 0): Observable<GroupSearchResponse> {

        this.searchOptions.pageIndex = pageIndex;
        this.allSelected = false;

        const observable = this.groupService
            .search(this.searchOptions);

        observable.subscribe({
            next: response => {
                this.groups = response.groups;
                this.headers = response.headers;
            },
            error: err => {

                this.errorService.handleError(err, "Groups", "Load");

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

    select(group: Group) {
        if (this.multiple) {
            if (this.isSelected(group)) {
                for (let i = 0; i < this.selectedItems.length; i++) {
                    if (this.selectedItems[i].groupId === group.groupId) {
                        this.selectedItems.splice(i, 1);
                        break;
                    }
                }
            } else {
                this.selectedItems.push(group);
            }
        } else {
            this.modal.close(group);
        }
    }

    isSelected(group: Group) {
        if (!this.multiple) return false;
        return this.selectedItems.filter(item => item.groupId === group.groupId).length > 0;
    }

    toggleAll() {
        this.allSelected = !this.allSelected;
        this.groups.forEach(group => {
            const isSelected = this.isSelected(group);
			if (isSelected && !this.allSelected) {
                for (let i = 0; i < this.selectedItems.length; i++) {
                    if (this.selectedItems[i].groupId === group.groupId) {
                        this.selectedItems.splice(i, 1);
                        break;
                    }
                }
            } else if (!isSelected && this.allSelected) {
                this.selectedItems.push(group);
            }
        });
    }

    selectAll() {

        const oldPageSize = this.searchOptions.pageSize;
        this.searchOptions.pageSize = 0;
        this.searchOptions.pageIndex = 0;

        this.groupService.search(this.searchOptions)
            .subscribe({
                next: response => {
                    this.modal.close(response.groups);
                    this.groups = response.groups;
                    this.searchOptions.pageSize = oldPageSize;
                },
                error: err => {
                    this.errorService.handleError(err, "Groups", "Load");
                }
            });

    }

    addNew() {
        window.open("/groups/add", "_blank");
    }
}
