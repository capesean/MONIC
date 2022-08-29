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

    modal: NgbModalRef;
    user: User | User[];
    selectedItems: User[] = [];
    headers: PagingHeaders = new PagingHeaders();
    searchOptions: UserSearchOptions = new UserSearchOptions();
    users: User[];
    allSelected = false;

    @ViewChild('content') content: TemplateRef<unknown>;
    @Output() change: EventEmitter<User> = new EventEmitter<User>();
    @Output() changes: EventEmitter<User[]> = new EventEmitter<User[]>();
    @Input() canRemoveFilters = false;
    @Input() multiple = false;
    @Input() showAddNew = false;
    @Input() title = this.multiple ? "Select users" : "Select an user";
    @Input() role: Enum;

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
        this.searchOptions.roleName = this.role ? this.role.name : undefined;
        this.modal = this.modalService.open(this.content, { size: 'xl', centered: true, scrollable: true });
        this.runSearch();
        this.modal.result.then((user: User | User[]) => {
            this.user = user;
            if (this.multiple) this.changes.emit(user as User[]);
            else this.change.emit(user as User);
        }, () => {
            // dismissed
        });
        return this.modal;
    }

    public runSearch(pageIndex = 0): Observable<UserSearchResponse> {

        this.searchOptions.pageIndex = pageIndex;

        const observable = this.userService
            .search(this.searchOptions);

        observable.subscribe(
            response => {
                this.users = response.users;
                this.headers = response.headers;
            },
            err => {

                this.errorService.handleError(err, "Users", "Load");

            }
        );

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

            .subscribe(
                response => {
                    this.modal.close(response.users);
                    this.users = response.users;
                    this.searchOptions.pageSize = oldPageSize;
                },
                err => {
                    this.errorService.handleError(err, "Users", "Load");
                }
            );

    }

    addNew() {
        window.open("/users/add", "_blank");
    }
}
