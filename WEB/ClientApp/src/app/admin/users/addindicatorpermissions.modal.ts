import { Component as NgComponent, OnInit, ViewChild, Output, EventEmitter, TemplateRef } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AppSettings } from '../../common/models/appsettings.model';
import { Indicator } from '../../common/models/indicator.model';

@NgComponent({
    selector: 'addindicatorpermissions-modal',
    templateUrl: './addindicatorpermissions.modal.html'
})
export class AddIndicatorsPermissionModal {

    public appSettings: AppSettings;
    public indicators: Indicator[] = [];
    public options = new AddIndicatorsPermissionOptions();

    constructor(
        public modal: NgbActiveModal,
    ) {
    }

    close(): void {
        this.modal.close(this.options);
    }
}

export class AddIndicatorsPermissionOptions {
    public edit: boolean;
    public submit: boolean;
    public verify: boolean;
    public approve: boolean;
}
