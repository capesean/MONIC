import { Component as NgComponent, OnInit, ViewChild, Output, EventEmitter, TemplateRef, Input } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { ItemSearchOptions, ItemSearchResponse, Item } from '../../common/models/item.model';
import { ItemService } from '../../common/services/item.service';
import { PagingHeaders } from '../../common/models/http.model';
import { ErrorService } from '../../common/services/error.service';
import { Enum, Enums } from '../../common/models/enums.model';

@NgComponent({
    selector: 'item-modal',
    templateUrl: './item.modal.component.html',
    standalone: false
})
export class ItemModalComponent implements OnInit {

    public modal: NgbModalRef;
    public selectedItems: Item[] = [];
    public headers: PagingHeaders = new PagingHeaders();
    public searchOptions: ItemSearchOptions = new ItemSearchOptions();
    public items: Item[];
    public allSelected = false;
    itemTypes = Enums.ItemTypes;

    @ViewChild('content') content: TemplateRef<unknown>;
    @Output() change: EventEmitter<Item> = new EventEmitter<Item>();
    @Output() changes: EventEmitter<Item[]> = new EventEmitter<Item[]>();
    @Input() canRemoveFilters = false;
    @Input() multiple = false;
    @Input() showAddNew = false;
    @Input() showFilters = true;
    @Input() showFooter = true;
    @Input() resetOnOpen = false;
    @Input() title = this.multiple ? "Select items" : "Select an item";
    @Input() itemType: Enum;

    constructor(
        private modalService: NgbModal,
        private itemService: ItemService,
        private errorService: ErrorService
    ) {
    }

    ngOnInit(): void {
        this.searchOptions.includeParents = true;
    }

    open(): NgbModalRef {
        if (this.resetOnOpen) this.selectedItems = [];
        this.searchOptions.itemType = this.itemType?.value;
        this.modal = this.modalService.open(this.content, { size: 'xl', centered: true, scrollable: false });
        this.runSearch();
        this.modal.result.then((item: Item | Item[]) => {
            if (this.multiple) this.changes.emit(item as Item[]);
            else this.change.emit(item as Item);
        }, () => {
            // dismissed
        });
        return this.modal;
    }

    public runSearch(pageIndex = 0): Observable<ItemSearchResponse> {

        this.searchOptions.pageIndex = pageIndex;
        this.allSelected = false;

        const observable = this.itemService
            .search(this.searchOptions);

        observable.subscribe({
            next: response => {
                this.items = response.items;
                this.headers = response.headers;
            },
            error: err => {

                this.errorService.handleError(err, "Items", "Load");

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

    select(item: Item) {
        if (this.multiple) {
            if (this.isSelected(item)) {
                for (let i = 0; i < this.selectedItems.length; i++) {
                    if (this.selectedItems[i].itemId === item.itemId) {
                        this.selectedItems.splice(i, 1);
                        break;
                    }
                }
            } else {
                this.selectedItems.push(item);
            }
        } else {
            this.modal.close(item);
        }
    }

    isSelected(item: Item) {
        if (!this.multiple) return false;
        return this.selectedItems.filter(item => item.itemId === item.itemId).length > 0;
    }

    toggleAll() {
        this.allSelected = !this.allSelected;
        this.items.forEach(item => {
            const isSelected = this.isSelected(item);
			if (isSelected && !this.allSelected) {
                for (let i = 0; i < this.selectedItems.length; i++) {
                    if (this.selectedItems[i].itemId === item.itemId) {
                        this.selectedItems.splice(i, 1);
                        break;
                    }
                }
            } else if (!isSelected && this.allSelected) {
                this.selectedItems.push(item);
            }
        });
    }

    selectAll() {

        const oldPageSize = this.searchOptions.pageSize;
        this.searchOptions.pageSize = 0;
        this.searchOptions.pageIndex = 0;

        this.itemService.search(this.searchOptions)
            .subscribe({
                next: response => {
                    this.modal.close(response.items);
                    this.items = response.items;
                    this.searchOptions.pageSize = oldPageSize;
                },
                error: err => {
                    this.errorService.handleError(err, "Items", "Load");
                }
            });

    }

    addNew() {
        window.open("/items/add", "_blank");
    }
}
