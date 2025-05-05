import { Component as NgComponent, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CdkDragDrop, CdkDragStart, moveItemInArray } from '@angular/cdk/drag-drop';
import { SectionSearchOptions, SectionSearchResponse, Section } from '../../common/models/section.model';
import { SectionService } from '../../common/services/section.service';
import { PagingHeaders } from '../../common/models/http.model';
import { ErrorService } from '../../common/services/error.service';
import { ToastrService } from 'ngx-toastr';

@NgComponent({
    selector: 'section-sort',
    templateUrl: './section.sort.component.html',
    standalone: false
})
export class SectionSortComponent implements OnInit {

    public headers: PagingHeaders = new PagingHeaders();
    private bodyElement: HTMLElement = document.body;
    public sections: Section[];
    public questionnaireId: string;

    constructor(
        public modal: NgbActiveModal,
        private sectionService: SectionService,
        private errorService: ErrorService,
        private toastr: ToastrService
    ) {
    }

    ngOnInit(): void {
        this.sectionService.search({ questionnaireId: this.questionnaireId, pageSize: 0, includeParents: true } as SectionSearchOptions)
            .subscribe({
                next: response => this.sections = response.sections,
                error: err => this.errorService.handleError(err, "Sections", "Load")
            });
    }

    dragStart(event: CdkDragStart) {
        this.bodyElement.classList.add('inheritCursors');
        this.bodyElement.style.cursor = 'grabbing';
    }

    drop(event: CdkDragDrop<Section[]>) {
        this.bodyElement.classList.remove('inheritCursors');
        this.bodyElement.style.cursor = 'unset';
        moveItemInArray(this.sections, event.previousIndex, event.currentIndex);
    }

    close() {
        this.sectionService.sort(this.questionnaireId, this.sections.map(o => o.sectionId))
            .subscribe({
                next: () => {
                    this.modal.close();
                    this.toastr.success("The sort order has been updated", "Change Sort Order");
                },
                error: err => {
                    this.errorService.handleError(err, "Sections", "Sort");
                }
            });
    }

}

