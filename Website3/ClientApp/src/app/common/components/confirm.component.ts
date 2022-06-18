import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-confirm',
    templateUrl: './confirm.component.html'
})
export class ConfirmModalComponent {

    protected _options: ModalOptions = new ModalOptions();
    @Input() set options(opts: ModalOptions) { this._options = { ...this._options, ...opts }; }

    constructor(public modal: NgbActiveModal) { }

}

export class ModalOptions {
    title: string = "Confirm";
    text: string = "Please confirm if you want to proceed";
    ok = "Ok";
    cancel = "Cancel";
}
