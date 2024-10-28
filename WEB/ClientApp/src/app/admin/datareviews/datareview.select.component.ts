import { Component as NgComponent, OnInit, forwardRef, ViewChild, Input, EventEmitter, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DataReviewModalComponent } from './datareview.modal.component';
import { DataReview } from '../../common/models/datareview.model';
import { Enum } from '../../common/models/enums.model';
import { User } from '../../common/models/user.model';
import * as moment from 'moment';

@NgComponent({
    selector: 'data-review-select',
    templateUrl: './datareview.select.component.html',
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => DataReviewSelectComponent),
        multi: true
    }],
    host: { 'class': 'app-select' }
})
export class DataReviewSelectComponent implements OnInit, ControlValueAccessor {

    @Input() dataReview: DataReview;
    @Input() dataReviews: DataReview[] = [];
    @Output() dataReviewChange = new EventEmitter<DataReview>();
    @Output() dataReviewsChange = new EventEmitter<DataReview[]>();
    @Input() canRemoveFilters = false;
    @Input() multiple = false;
    @Input() showAddNew = false;
    @Input() user: User;
    @Input() reviewStatus: Enum;

    disabled = false;
    placeholder = this.multiple ? "Select data reviews" : "Select a data review";

    @ViewChild('modal') modal: DataReviewModalComponent;

    constructor(
    ) {
    }

    ngOnInit(): void {
    }

    propagateChange = (_: any) => { };

    writeValue(dataReviewId: string | string[]): void {
        if (dataReviewId !== undefined) {
            this.propagateChange(dataReviewId);
        }
    }

    registerOnChange(fn: any): void {
        this.propagateChange = fn;
    }

    registerOnTouched(): void {
    }

    setDisabledState?(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }

    changed(dataReview: DataReview | DataReview[]) {
        if (this.disabled) return;
        if (this.multiple) {
            this.writeValue(dataReview ? (dataReview as DataReview[]).map(o => o.dataReviewId) : null);
            this.dataReviews = (dataReview as DataReview[]);
            this.dataReviewsChange.emit((dataReview as DataReview[]));
        } else {
            this.writeValue(dataReview ? (dataReview as DataReview).dataReviewId : null);
            this.dataReview = (dataReview as DataReview);
            this.dataReviewChange.emit((dataReview as DataReview));
        }
    }

    getLabel() {
        return this.multiple ? this.dataReviews.map(dataReview => (dataReview.dateUtc ? moment(dataReview.dateUtc).format("LL") : undefined)).join(", ") : (this.dataReview?.dateUtc ? moment(this.dataReview?.dateUtc).format("LL") : undefined) ?? "";
    }

    click(button = false) {
        if (this.disabled) return;
        // clear the selector if there is something there already
        if (button && (this.dataReview || this.dataReviews.length)) this.changed(this.multiple ? [] : null);
        else this.modal.open();
    }

    clear() {
        this.changed(this.multiple ? [] : null);
    }
}

