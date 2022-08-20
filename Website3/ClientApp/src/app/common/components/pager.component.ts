import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { PagingHeaders } from './../models/http.model';

@Component({
    selector: 'pager',
    templateUrl: './pager.component.html',
    styleUrls: ['./pager.component.css']
})
export class PagerComponent {

    @Input()
    set headers(headers: PagingHeaders) {
        this.pagerHeaders = headers;
        if (headers == undefined || headers.totalRecords === undefined)
            this.pagerInfo = "";
        else if (headers.totalRecords === 0)
            this.pagerInfo = "No data";
        else if (headers.totalRecords === 1)
            this.pagerInfo = "Displaying 1 of 1";
        else if (headers.totalPages === 1 || headers.pageSize === 0)
            this.pagerInfo = "Displaying all " + headers.totalRecords;
        else if (headers.pageIndex === headers.totalPages - 1)
            this.pagerInfo = "Displaying " + (headers.pageIndex * headers.pageSize + 1) + " - " + headers.totalRecords + " of " + headers.totalRecords;
        else
            this.pagerInfo = "Displaying " + (headers.pageIndex * headers.pageSize + 1) + " - " + ((headers.pageIndex + 1) * headers.pageSize) + " of " + headers.totalRecords;
    }

    @Output() pageChanged: EventEmitter<number> = new EventEmitter();
    pagerInfo: string;
    pagerHeaders: PagingHeaders;

    constructor() { }

    changePage(pageIndex: number) {
        this.pageChanged.emit(pageIndex);
    }
}
