import { Component, OnInit, ViewChild, Output, EventEmitter, TemplateRef, Input } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { UserSearchOptions, UserSearchResponse, User } from '../common/models/user.model';
import { UserService } from '../common/services/user.service';
import { PagingHeaders } from '../common/models/http.model';
import { ErrorService } from '../common/services/error.service';
import { Enum } from '../common/models/enums.model';

@Component({
    selector: 'user-modal',
    templateUrl: './user.modal.component.html'
})
export class UserModalComponent implements OnInit {

    public modal: NgbModalRef;
    public selectedItems: User[] = [];
    public headers: PagingHeaders = new PagingHeaders();
    public searchOptions: UserSearchOptions = new UserSearchOptions();
    public users: User[];
    public allSelected = false;

    @ViewChild('content') content: TemplateRef<unknown>;
    @Output() change: EventEmitter<User> = new EventEmitter<User>();
    @Output() changes: EventEmitter<User[]> = new EventEmitter<User[]>();
    @Input() canRemoveFilters = false;
    @Input() multiple = false;
    @Input() showAddNew = false;
    @Input() showFilters = true;
    @Input() showFooter = true;
    @Input() resetOnOpen = false;
    @Input() title = this.multiple ? "Select users" : "Select a user";
    @Input() role: Enum;
    @Input() disabled: boolean;

    constructor(
        private modalService: NgbModal,
        private userService: UserService,
        private errorService: ErrorService
    ) {
    }

    ngOnInit(): void {
        this.searchOptions.includeParents = true;
    }

    open(): NgbModalRef {
        if (this.resetOnOpen) this.selectedItems = [];
        this.searchOptions.roleName = this.role ? this.role.name : undefined;
        this.searchOptions.disabled = this.disabled;
        this.modal = this.modalService.open(this.content, { size: 'xl', centered: true, scrollable: true });
        this.runSearch();
        this.modal.result.then((user: User | User[]) => {
            if (this.multiple) this.changes.emit(user as User[]);
            else this.change.emit(user as User);
        }, () => {
            // dismissed
        });
        return this.modal;
    }

    public runSearch(pageIndex = 0): Observable<UserSearchResponse> {

        this.searchOptions.pageIndex = pageIndex;
        this.allSelected = false;

        const observable = this.userService
            .search(this.searchOptions);

        observable.subscribe({
            next: response => {
                this.users = response.users;
                this.headers = response.headers;
            },
            error: err => {

                this.errorService.handleError(err, "Users", "Load");

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

    select(user: User) {
        if (this.multiple) {
            if (this.isSelected(user)) {
                for (let i = 0; i < this.selectedItems.length; i++) {
                    if (this.selectedItems[i].id === user.id) {
                        this.selectedItems.splice(i, 1);
                        break;
                    }
                }
            } else {
                this.selectedItems.push(user);
            }
        } else {
            this.modal.close(user);
        }
    }

    isSelected(user: User) {
        if (!this.multiple) return false;
        return this.selectedItems.filter(item => item.id === user.id).length > 0;
    }

    toggleAll() {
        this.allSelected = !this.allSelected;
        this.users.forEach(user => {
            const isSelected = this.isSelected(user);
			if (isSelected && !this.allSelected) {
                for (let i = 0; i < this.selectedItems.length; i++) {
                    if (this.selectedItems[i].id === user.id) {
                        this.selectedItems.splice(i, 1);
                        break;
                    }
                }
            } else if (!isSelected && this.allSelected) {
                this.selectedItems.push(user);
            }
        });
    }

    selectAll() {

        const oldPageSize = this.searchOptions.pageSize;
        this.searchOptions.pageSize = 0;
        this.searchOptions.pageIndex = 0;

        this.userService.search(this.searchOptions)
            .subscribe({
                next: response => {
                    this.modal.close(response.users);
                    this.users = response.users;
                    this.searchOptions.pageSize = oldPageSize;
                },
                error: err => {
                    this.errorService.handleError(err, "Users", "Load");
                }
            });

    }

    addNew() {
        window.open("/users/add", "_blank");
    }
}
