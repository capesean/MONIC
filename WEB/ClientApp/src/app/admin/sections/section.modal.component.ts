import { Component as NgComponent, OnInit, ViewChild, Output, EventEmitter, TemplateRef, Input } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { SectionSearchOptions, SectionSearchResponse, Section } from '../../common/models/section.model';
import { SectionService } from '../../common/services/section.service';
import { PagingHeaders } from '../../common/models/http.model';
import { ErrorService } from '../../common/services/error.service';
import { Questionnaire } from '../../common/models/questionnaire.model';

@NgComponent({
    selector: 'section-modal',
    templateUrl: './section.modal.component.html'
})
export class SectionModalComponent implements OnInit {

    public modal: NgbModalRef;
    public selectedItems: Section[] = [];
    public headers: PagingHeaders = new PagingHeaders();
    public searchOptions: SectionSearchOptions = new SectionSearchOptions();
    public sections: Section[];
    public allSelected = false;

    @ViewChild('content') content: TemplateRef<unknown>;
    @Output() change: EventEmitter<Section> = new EventEmitter<Section>();
    @Output() changes: EventEmitter<Section[]> = new EventEmitter<Section[]>();
    @Input() canRemoveFilters = false;
    @Input() multiple = false;
    @Input() showAddNew = false;
    @Input() showFilters = true;
    @Input() showFooter = true;
    @Input() resetOnOpen = false;
    @Input() title = this.multiple ? "Select sections" : "Select a section";
    @Input() questionnaire: Questionnaire;

    constructor(
        private modalService: NgbModal,
        private sectionService: SectionService,
        private errorService: ErrorService
    ) {
    }

    ngOnInit(): void {
        this.searchOptions.includeParents = true;
    }

    open(): NgbModalRef {
        if (this.resetOnOpen) this.selectedItems = [];
        this.searchOptions.questionnaireId = this.questionnaire?.questionnaireId;
        this.modal = this.modalService.open(this.content, { size: 'xl', centered: true, scrollable: true });
        this.runSearch();
        this.modal.result.then((section: Section | Section[]) => {
            if (this.multiple) this.changes.emit(section as Section[]);
            else this.change.emit(section as Section);
        }, () => {
            // dismissed
        });
        return this.modal;
    }

    public runSearch(pageIndex = 0): Observable<SectionSearchResponse> {

        this.searchOptions.pageIndex = pageIndex;
        this.allSelected = false;

        const observable = this.sectionService
            .search(this.searchOptions);

        observable.subscribe({
            next: response => {
                this.sections = response.sections;
                this.headers = response.headers;
            },
            error: err => {

                this.errorService.handleError(err, "Sections", "Load");

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

    select(section: Section) {
        if (this.multiple) {
            if (this.isSelected(section)) {
                for (let i = 0; i < this.selectedItems.length; i++) {
                    if (this.selectedItems[i].sectionId === section.sectionId) {
                        this.selectedItems.splice(i, 1);
                        break;
                    }
                }
            } else {
                this.selectedItems.push(section);
            }
        } else {
            this.modal.close(section);
        }
    }

    isSelected(section: Section) {
        if (!this.multiple) return false;
        return this.selectedItems.filter(item => item.sectionId === section.sectionId).length > 0;
    }

    toggleAll() {
        this.allSelected = !this.allSelected;
        this.sections.forEach(section => {
            const isSelected = this.isSelected(section);
			if (isSelected && !this.allSelected) {
                for (let i = 0; i < this.selectedItems.length; i++) {
                    if (this.selectedItems[i].sectionId === section.sectionId) {
                        this.selectedItems.splice(i, 1);
                        break;
                    }
                }
            } else if (!isSelected && this.allSelected) {
                this.selectedItems.push(section);
            }
        });
    }

    selectAll() {

        const oldPageSize = this.searchOptions.pageSize;
        this.searchOptions.pageSize = 0;
        this.searchOptions.pageIndex = 0;

        this.sectionService.search(this.searchOptions)
            .subscribe({
                next: response => {
                    this.modal.close(response.sections);
                    this.sections = response.sections;
                    this.searchOptions.pageSize = oldPageSize;
                },
                error: err => {
                    this.errorService.handleError(err, "Sections", "Load");
                }
            });

    }

    addNew() {
        window.open("/sections/add", "_blank");
    }
}
