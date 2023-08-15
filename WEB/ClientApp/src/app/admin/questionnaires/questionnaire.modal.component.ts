import { Component as NgComponent, OnInit, ViewChild, Output, EventEmitter, TemplateRef, Input } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { QuestionnaireSearchOptions, QuestionnaireSearchResponse, Questionnaire } from '../../common/models/questionnaire.model';
import { QuestionnaireService } from '../../common/services/questionnaire.service';
import { PagingHeaders } from '../../common/models/http.model';
import { ErrorService } from '../../common/services/error.service';
import { Enum, Enums } from '../../common/models/enums.model';
import { EntityType } from '../../common/models/entitytype.model';

@NgComponent({
    selector: 'questionnaire-modal',
    templateUrl: './questionnaire.modal.component.html'
})
export class QuestionnaireModalComponent implements OnInit {

    public modal: NgbModalRef;
    public selectedItems: Questionnaire[] = [];
    public headers: PagingHeaders = new PagingHeaders();
    public searchOptions: QuestionnaireSearchOptions = new QuestionnaireSearchOptions();
    public questionnaires: Questionnaire[];
    public allSelected = false;
    dateTypes = Enums.DateTypes;

    @ViewChild('content') content: TemplateRef<unknown>;
    @Output() change: EventEmitter<Questionnaire> = new EventEmitter<Questionnaire>();
    @Output() changes: EventEmitter<Questionnaire[]> = new EventEmitter<Questionnaire[]>();
    @Input() canRemoveFilters = false;
    @Input() multiple = false;
    @Input() showAddNew = false;
    @Input() title = this.multiple ? "Select questionnaires" : "Select a questionnaire";
    @Input() entityType: EntityType;
    @Input() dateType: Enum;

    constructor(
        private modalService: NgbModal,
        private questionnaireService: QuestionnaireService,
        private errorService: ErrorService
    ) {
    }

    ngOnInit(): void {
        this.searchOptions.includeParents = true;
    }

    open(): NgbModalRef {
        this.searchOptions.entityTypeId = this.entityType?.entityTypeId;
        this.searchOptions.dateType = this.dateType?.value;
        this.modal = this.modalService.open(this.content, { size: 'xl', centered: true, scrollable: true });
        this.runSearch();
        this.modal.result.then((questionnaire: Questionnaire | Questionnaire[]) => {
            if (this.multiple) this.changes.emit(questionnaire as Questionnaire[]);
            else this.change.emit(questionnaire as Questionnaire);
        }, () => {
            // dismissed
        });
        return this.modal;
    }

    public runSearch(pageIndex = 0): Observable<QuestionnaireSearchResponse> {

        this.searchOptions.pageIndex = pageIndex;
        this.allSelected = false;

        const observable = this.questionnaireService
            .search(this.searchOptions);

        observable.subscribe({
            next: response => {
                this.questionnaires = response.questionnaires;
                this.headers = response.headers;
            },
            error: err => {

                this.errorService.handleError(err, "Questionnaires", "Load");

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

    select(questionnaire: Questionnaire) {
        if (this.multiple) {
            if (this.isSelected(questionnaire)) {
                for (let i = 0; i < this.selectedItems.length; i++) {
                    if (this.selectedItems[i].questionnaireId === questionnaire.questionnaireId) {
                        this.selectedItems.splice(i, 1);
                        break;
                    }
                }
            } else {
                this.selectedItems.push(questionnaire);
            }
        } else {
            this.modal.close(questionnaire);
        }
    }

    isSelected(questionnaire: Questionnaire) {
        if (!this.multiple) return false;
        return this.selectedItems.filter(item => item.questionnaireId === questionnaire.questionnaireId).length > 0;
    }

    toggleAll() {
        this.allSelected = !this.allSelected;
        this.questionnaires.forEach(questionnaire => {
            const isSelected = this.isSelected(questionnaire);
			if (isSelected && !this.allSelected) {
                for (let i = 0; i < this.selectedItems.length; i++) {
                    if (this.selectedItems[i].questionnaireId === questionnaire.questionnaireId) {
                        this.selectedItems.splice(i, 1);
                        break;
                    }
                }
            } else if (!isSelected && this.allSelected) {
                this.selectedItems.push(questionnaire);
            }
        });
    }

    selectAll() {

        const oldPageSize = this.searchOptions.pageSize;
        this.searchOptions.pageSize = 0;
        this.searchOptions.pageIndex = 0;

        this.questionnaireService.search(this.searchOptions)
            .subscribe({
                next: response => {
                    this.modal.close(response.questionnaires);
                    this.questionnaires = response.questionnaires;
                    this.searchOptions.pageSize = oldPageSize;
                },
                error: err => {
                    this.errorService.handleError(err, "Questionnaires", "Load");
                }
            });

    }

    addNew() {
        window.open("/questionnaires/add", "_blank");
    }
}
