import { Component as NgComponent, OnInit, ViewChild, Output, EventEmitter, TemplateRef } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { IndicatorSearchOptions, IndicatorSearchResponse, Indicator } from '../../common/models/indicator.model';
import { IndicatorService } from '../../common/services/indicator.service';
import { PagingHeaders } from '../../common/models/http.model';
import { ErrorService } from '../../common/services/error.service';
import { Enums } from '../../common/models/enums.model';
import { Category } from '../../common/models/category.model';
import { IndicatorPermission } from '../../common/models/indicatorpermission.model';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../../common/services/user.service';
import { User } from '../../common/models/user.model';

@NgComponent({
    selector: 'addindicatorpermissions-modal',
    templateUrl: './addindicatorpermissions.modal.html'
})
export class AddIndicatorsPermissionModal implements OnInit {

    user: User;
    indicatorPermission: IndicatorPermission;
    indicators: Indicator[];
    useAll = false;
    category: Category;
    selectedItems: Indicator[] = [];
    headers: PagingHeaders = new PagingHeaders();
    searchOptions: IndicatorSearchOptions = new IndicatorSearchOptions();
    allSelected = false;
    dateTypes = Enums.DateTypes;
    indicatorStatuses = Enums.IndicatorStatuses;
    indicatorTypes = Enums.IndicatorTypes;

    @ViewChild('content') content: TemplateRef<unknown>;
    @Output() changes: EventEmitter<Indicator[]> = new EventEmitter<Indicator[]>();

    constructor(
        public modal: NgbActiveModal,
        private indicatorService: IndicatorService,
        private errorService: ErrorService,
        private toastr: ToastrService,
        private userService: UserService
    ) {
    }

    ngOnInit(): void {
        this.indicatorPermission = new IndicatorPermission();
        this.searchOptions.includeParents = true;
        this.runSearch().subscribe();
    }

    public setUser(user: User): void {
        this.user = user;
        this.selectedItems = [];
    }

    public runSearch(pageIndex = 0): Observable<IndicatorSearchResponse> {

        this.searchOptions.pageIndex = pageIndex;

        const observable = this.indicatorService
            .search(this.searchOptions);

        observable.subscribe({
            next: response => {
                this.indicators = response.indicators;
                this.headers = response.headers;
            },
            error: err => {

                this.errorService.handleError(err, "Indicators", "Load");

            }
        });

        return observable;

    }

    clear() {
        this.selectedItems = [];
    }

    select(indicator: Indicator) {
        if (this.isSelected(indicator)) {
            for (let i = 0; i < this.selectedItems.length; i++) {
                if (this.selectedItems[i].indicatorId === indicator.indicatorId) {
                    this.selectedItems.splice(i, 1);
                    break;
                }
            }
        } else {
            this.selectedItems.push(indicator);
        }
    }

    isSelected(indicator: Indicator) {
        return this.selectedItems.filter(item => item.indicatorId === indicator.indicatorId).length > 0;
    }

    toggleAll() {
        this.allSelected = !this.allSelected;
        // todo: better way using .find? or something else?
        this.indicators.forEach(indicator => {
            const isSelected = this.isSelected(indicator);
            if (isSelected && !this.allSelected) {
                for (let i = 0; i < this.selectedItems.length; i++) {
                    if (this.selectedItems[i].indicatorId === indicator.indicatorId) {
                        this.selectedItems.splice(i, 1);
                        break;
                    }
                }
            } else if (!isSelected && this.allSelected) {
                this.selectedItems.push(indicator);
            }
        });
    }

    addIndicatorPermissions(): void {

        if (!this.useAll && !this.selectedItems.length) {
            this.toastr.error("You have not selected any indicators");
            return;
        }

        const indicatorPermissions: IndicatorPermission[] = [];
        if (this.useAll) {
            indicatorPermissions.push({
                userId: this.user.id,
                indicatorId: null,
                edit: this.indicatorPermission.edit,
                submit: this.indicatorPermission.submit,
                verify: this.indicatorPermission.verify,
                approve: this.indicatorPermission.approve,
            } as IndicatorPermission);
        } else {
            this.selectedItems.forEach(indicator => {
                indicatorPermissions.push({
                    userId: this.user.id,
                    indicatorId: indicator.indicatorId,
                    edit: this.indicatorPermission.edit,
                    submit: this.indicatorPermission.submit,
                    verify: this.indicatorPermission.verify,
                    approve: this.indicatorPermission.approve,
                } as IndicatorPermission);
            });
        }

        this.userService.addIndicatorPermissions(this.user.id, indicatorPermissions)
            .subscribe({
                next: () => {
                    this.toastr.success("The indicator permissions have been added");
                    this.modal.close();
                },
                error: err => this.errorService.handleError(err, "Indicator Permissions", "Save")
            });

    }
}
