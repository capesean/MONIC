import { Component as NgComponent, OnInit, forwardRef, ViewChild, Input, EventEmitter, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { OrganisationModalComponent } from './organisation.modal.component';
import { Organisation } from '../../common/models/organisation.model';
import { Enum } from '../../common/models/enums.model';

@NgComponent({
    selector: 'organisation-select',
    templateUrl: './organisation.select.component.html',
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => OrganisationSelectComponent),
        multi: true
    }],
    host: { 'class': 'app-select' }
})
export class OrganisationSelectComponent implements OnInit, ControlValueAccessor {

    @Input() organisation: Organisation;
    @Input() organisations: Organisation[] = [];
    @Output() organisationChange = new EventEmitter<Organisation>();
    @Output() organisationsChange = new EventEmitter<Organisation[]>();
    @Input() canRemoveFilters = false;
    @Input() multiple = false;
    @Input() showAddNew = false;

    disabled = false;
    placeholder = this.multiple ? "Select organisations" : "Select an organisation";

    @ViewChild('modal') modal: OrganisationModalComponent;

    constructor(
    ) {
    }

    ngOnInit(): void {
    }

    propagateChange = (_: any) => { };

    writeValue(organisationId: string | string[]): void {
        if (organisationId !== undefined) {
            this.propagateChange(organisationId);
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

    changed(organisation: Organisation | Organisation[]) {
        if (this.disabled) return;
        if (this.multiple) {
            this.writeValue(organisation ? (organisation as Organisation[]).map(o => o.organisationId) : null);
            this.organisations = (organisation as Organisation[]);
            this.organisationsChange.emit((organisation as Organisation[]));
        } else {
            this.writeValue(organisation ? (organisation as Organisation).organisationId : null);
            this.organisation = (organisation as Organisation);
            this.organisationChange.emit((organisation as Organisation));
        }
    }

    getLabel() {
        return this.multiple ? this.organisations.map(organisation => organisation.name).join(", ") : this.organisation?.name ?? "";
    }

    click(button = false) {
        if (this.disabled) return;
        if (button && (this.organisation || this.organisations)) this.changed(this.multiple ? [] : null);
        else this.modal.open();
    }
}
