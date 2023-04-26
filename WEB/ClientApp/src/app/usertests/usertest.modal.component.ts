import { Component, OnInit, ViewChild, Output, EventEmitter, TemplateRef, Input } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { UserTestSearchOptions, UserTestSearchResponse, UserTest } from '../common/models/usertest.model';
import { UserTestService } from '../common/services/usertest.service';
import { PagingHeaders } from '../common/models/http.model';
import { ErrorService } from '../common/services/error.service';
import { User } from '../common/models/user.model';

@Component({
    selector: 'user-test-modal',
    templateUrl: './usertest.modal.component.html'
})
export class UserTestModalComponent implements OnInit {

    public modal: NgbModalRef;
    public selectedItems: UserTest[] = [];
    public headers: PagingHeaders = new PagingHeaders();
    public searchOptions: UserTestSearchOptions = new UserTestSearchOptions();
    public userTests: UserTest[];
    public allSelected = false;

    @ViewChild('content') content: TemplateRef<unknown>;
    @Output() change: EventEmitter<UserTest> = new EventEmitter<UserTest>();
    @Output() changes: EventEmitter<UserTest[]> = new EventEmitter<UserTest[]>();
    @Input() canRemoveFilters = false;
    @Input() multiple = false;
    @Input() showAddNew = false;
    @Input() title = this.multiple ? "Select user tests" : "Select an user test";
    @Input() user: User;

    constructor(
        private modalService: NgbModal,
        private userTestService: UserTestService,
        private errorService: ErrorService
    ) {
    }

    ngOnInit(): void {
        this.searchOptions.includeParents = true;
    }

    open(): NgbModalRef {
        this.searchOptions.userId = this.user?.id;
        this.modal = this.modalService.open(this.content, { size: 'xl', centered: true, scrollable: true });
        this.runSearch();
        this.modal.result.then((userTest: UserTest | UserTest[]) => {
            if (this.multiple) this.changes.emit(userTest as UserTest[]);
            else this.change.emit(userTest as UserTest);
        }, () => {
            // dismissed
        });
        return this.modal;
    }

    public runSearch(pageIndex = 0): Observable<UserTestSearchResponse> {

        this.searchOptions.pageIndex = pageIndex;

        const observable = this.userTestService
            .search(this.searchOptions);

        observable.subscribe({
            next: response => {
                this.userTests = response.userTests;
                this.headers = response.headers;
            },
            error: err => {

                this.errorService.handleError(err, "User Tests", "Load");

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

    select(userTest: UserTest) {
        if (this.multiple) {
            if (this.isSelected(userTest)) {
                for (let i = 0; i < this.selectedItems.length; i++) {
                    if (this.selectedItems[i].userTestId === userTest.userTestId) {
                        this.selectedItems.splice(i, 1);
                        break;
                    }
                }
            } else {
                this.selectedItems.push(userTest);
            }
        } else {
            this.modal.close(userTest);
        }
    }

    isSelected(userTest: UserTest) {
        if (!this.multiple) return false;
        return this.selectedItems.filter(item => item.userTestId === userTest.userTestId).length > 0;
    }

    toggleAll() {
        this.allSelected = !this.allSelected;
        this.userTests.forEach(userTest => {
            const isSelected = this.isSelected(userTest);
			if (isSelected && !this.allSelected) {
                for (let i = 0; i < this.selectedItems.length; i++) {
                    if (this.selectedItems[i].userTestId === userTest.userTestId) {
                        this.selectedItems.splice(i, 1);
                        break;
                    }
                }
            } else if (!isSelected && this.allSelected) {
                this.selectedItems.push(userTest);
            }
        });
    }

    selectAll() {

        const oldPageSize = this.searchOptions.pageSize;
        this.searchOptions.pageSize = 0;
        this.searchOptions.pageIndex = 0;

        this.userTestService.search(this.searchOptions)
            .subscribe({
                next: response => {
                    this.modal.close(response.userTests);
                    this.userTests = response.userTests;
                    this.searchOptions.pageSize = oldPageSize;
                },
                error: err => {
                    this.errorService.handleError(err, "User Tests", "Load");
                }
            });

    }

    addNew() {
        window.open("/usertests/add", "_blank");
    }
}
