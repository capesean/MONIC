import { Component as NgComponent, OnInit, ViewChild, Output, EventEmitter, TemplateRef, Input } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { ComponentSearchOptions, ComponentSearchResponse, Component } from '../../common/models/component.model';
import { ComponentService } from '../../common/services/component.service';
import { PagingHeaders } from '../../common/models/http.model';
import { ErrorService } from '../../common/services/error.service';
import { Enum, Enums } from '../../common/models/enums.model';

@NgComponent({
    selector: 'component-modal',
    templateUrl: './component.modal.component.html',
    standalone: false
})
export class ComponentModalComponent implements OnInit {

    public modal: NgbModalRef;
    public selectedItems: Component[] = [];
    public headers: PagingHeaders = new PagingHeaders();
    public searchOptions: ComponentSearchOptions = new ComponentSearchOptions();
    public components: Component[];
    public allSelected = false;
    componentTypes = Enums.ComponentTypes;

    @ViewChild('content') content: TemplateRef<unknown>;
    @Output() change: EventEmitter<Component> = new EventEmitter<Component>();
    @Output() changes: EventEmitter<Component[]> = new EventEmitter<Component[]>();
    @Input() canRemoveFilters = false;
    @Input() multiple = false;
    @Input() showAddNew = false;
    @Input() showFilters = true;
    @Input() showFooter = true;
    @Input() resetOnOpen = false;
    @Input() title = this.multiple ? "Select components" : "Select a component";
    @Input() componentType: Enum;

    constructor(
        private modalService: NgbModal,
        private componentService: ComponentService,
        private errorService: ErrorService
    ) {
    }

    ngOnInit(): void {
        this.searchOptions.includeParents = true;
    }

    open(): NgbModalRef {
        if (this.resetOnOpen) this.selectedItems = [];
        this.searchOptions.componentType = this.componentType?.value;
        this.modal = this.modalService.open(this.content, { size: 'xl', centered: true, scrollable: false });
        this.runSearch();
        this.modal.result.then((component: Component | Component[]) => {
            if (this.multiple) this.changes.emit(component as Component[]);
            else this.change.emit(component as Component);
        }, () => {
            // dismissed
        });
        return this.modal;
    }

    public runSearch(pageIndex = 0): Observable<ComponentSearchResponse> {

        this.searchOptions.pageIndex = pageIndex;
        this.allSelected = false;

        const observable = this.componentService
            .search(this.searchOptions);

        observable.subscribe({
            next: response => {
                this.components = response.components;
                this.headers = response.headers;
            },
            error: err => {

                this.errorService.handleError(err, "Components", "Load");

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

    select(component: Component) {
        if (this.multiple) {
            if (this.isSelected(component)) {
                for (let i = 0; i < this.selectedItems.length; i++) {
                    if (this.selectedItems[i].componentId === component.componentId) {
                        this.selectedItems.splice(i, 1);
                        break;
                    }
                }
            } else {
                this.selectedItems.push(component);
            }
        } else {
            this.modal.close(component);
        }
    }

    isSelected(component: Component) {
        if (!this.multiple) return false;
        return this.selectedItems.filter(item => item.componentId === component.componentId).length > 0;
    }

    toggleAll() {
        this.allSelected = !this.allSelected;
        this.components.forEach(component => {
            const isSelected = this.isSelected(component);
			if (isSelected && !this.allSelected) {
                for (let i = 0; i < this.selectedItems.length; i++) {
                    if (this.selectedItems[i].componentId === component.componentId) {
                        this.selectedItems.splice(i, 1);
                        break;
                    }
                }
            } else if (!isSelected && this.allSelected) {
                this.selectedItems.push(component);
            }
        });
    }

    selectAll() {

        const oldPageSize = this.searchOptions.pageSize;
        this.searchOptions.pageSize = 0;
        this.searchOptions.pageIndex = 0;

        this.componentService.search(this.searchOptions)
            .subscribe({
                next: response => {
                    this.modal.close(response.components);
                    this.components = response.components;
                    this.searchOptions.pageSize = oldPageSize;
                },
                error: err => {
                    this.errorService.handleError(err, "Components", "Load");
                }
            });

    }

    addNew() {
        window.open("/components/add", "_blank");
    }
}
