import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-prompt',
    templateUrl: './prompt.component.html'
})
export class PromptModalComponent {

    public _options: PromptModalOptions = new PromptModalOptions();
    protected okClass = "btn-outline-primary";
    protected cancelClass = "btn-outline-secondary";

    public response: string;

    @Input() set options(opts: PromptModalOptions) {
        this._options = { ...this._options, ...opts };
    }

    constructor(
        public modal: NgbActiveModal,
        private toastr: ToastrService
    ) { }

    ok() {
        if (!this.response) {
            this.toastr.error("You have not provided a response");
            return;
        }

        this.modal.close(this.response);
    }
}

export class PromptModalOptions {
    title: string = "";
    text: string = "";
    ok: string = "Ok";
    cancel: string = "Cancel";
}
