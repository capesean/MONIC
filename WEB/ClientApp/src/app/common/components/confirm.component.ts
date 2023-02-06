import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-confirm',
    templateUrl: './confirm.component.html'
})
export class ConfirmModalComponent {

    public _options: ModalOptions = new ModalOptions();
    protected okClass = "btn-outline-secondary";
    protected noClass = "btn-outline-secondary";
    protected cancelClass = "btn-danger";

    @Input() set options(opts: ModalOptions) {
        this._options = { ...this._options, ...opts };
        if (opts.deleteStyle) {
            this.okClass = "btn-danger";
            this.cancelClass = "btn-outline-secondary";
        }
    }

    constructor(public modal: NgbActiveModal) { }

}

export class ModalOptions {
    title: string = "Confirm";
    text: string = "Please confirm if you want to proceed";
    ok: string = "Ok";
    no: string = undefined;
    cancel: string = "Cancel";
    deleteStyle: boolean = false;
}
