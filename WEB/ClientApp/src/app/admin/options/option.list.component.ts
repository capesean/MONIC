import { Component as NgComponent, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PagingHeaders } from '../../common/models/http.model';
import { OptionSearchOptions, OptionSearchResponse, Option } from '../../common/models/option.model';
import { FadeThenShrink } from '../../common/animations/fadethenshrink';
import { ErrorService } from '../../common/services/error.service';
import { OptionService } from '../../common/services/option.service';
import { OptionSortComponent } from './option.sort.component';

@NgComponent({
    selector: 'option-list',
    templateUrl: './option.list.component.html',
    animations: [FadeThenShrink],
    standalone: false
})
export class OptionListComponent implements OnInit {

    public options: Option[] = [];
    public searchOptions = new OptionSearchOptions();
    public showSearchOptions = false;
    public headers = new PagingHeaders();

    constructor(
        public route: ActivatedRoute,
        private router: Router,
        private errorService: ErrorService,
        private modalService: NgbModal,
        private optionService: OptionService
    ) {
    }

    ngOnInit(): void {
        this.searchOptions.includeParents = true;
        this.runSearch();
    }

    runSearch(pageIndex = 0): Subject<OptionSearchResponse> {

        this.searchOptions.pageIndex = pageIndex;

        const subject = new Subject<OptionSearchResponse>();

        this.optionService.search(this.searchOptions)
            .subscribe({
                next: response => {
                    subject.next(response);
                    this.options = response.options;
                    this.headers = response.headers;
                },
                error: err => {
                    this.errorService.handleError(err, "Options", "Load");
                }
            });

        return subject;

    }

    showSort(): void {
        let modalRef = this.modalService.open(OptionSortComponent, { size: 'xl', centered: true, scrollable: false });
        modalRef.result.then(
            () => {

                this.searchOptions.orderBy = null;
                this.runSearch(this.headers.pageIndex);

            }, () => { });
    }

    goToOption(option: Option): void {
        this.router.navigate(["/optionlists", option.optionList.optionListId, "options", option.optionId]);
    }
}

