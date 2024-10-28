import { Component as NgComponent, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmModalComponent, ConfirmModalOptions } from '../../common/components/confirm.component';
import { Token } from '../../common/models/token.model';
import { Enum, Enums } from '../../common/models/enums.model';
import { BreadcrumbService } from '../../common/services/breadcrumb.service';
import { ErrorService } from '../../common/services/error.service';
import { TokenService } from '../../common/services/token.service';

@NgComponent({
    selector: 'token-edit',
    templateUrl: './token.edit.component.html'
})
export class TokenEditComponent implements OnInit {

    public token: Token = new Token();
    public isNew = true;
    public tokenTypes: Enum[] = Enums.TokenTypes;
    public operatorTypes: Enum[] = Enums.OperatorTypes;
    public parenthesisTypes: Enum[] = Enums.ParenthesisTypes;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private toastr: ToastrService,
        private breadcrumbService: BreadcrumbService,
        private modalService: NgbModal,
        private tokenService: TokenService,
        private errorService: ErrorService
    ) {
    }

    ngOnInit(): void {

        this.route.params.subscribe(params => {

            const indicatorId = params["indicatorId"];
            const tokenNumber = params["tokenNumber"];
            this.isNew = indicatorId === "add" && tokenNumber === "add";

            if (!this.isNew) {

                this.token.indicatorId = indicatorId;
                this.token.tokenNumber = +tokenNumber;
                this.loadToken();

            }

        });

    }

    private loadToken(): void {

        this.tokenService.get(this.token.indicatorId, this.token.tokenNumber)
            .subscribe({
                next: token => {
                    this.token = token;
                    this.changeBreadcrumb();
                },
                error: err => {
                    this.errorService.handleError(err, "Token", "Load");
                    if (err instanceof HttpErrorResponse && err.status === 404)
                        this.router.navigate(["../../"], { relativeTo: this.route });
                }
            });

    }

    save(form: NgForm): void {

        if (form.invalid) {

            this.toastr.error("The form has not been completed correctly.", "Form Error");
            return;

        }

        this.tokenService.save(this.token)
            .subscribe({
                next: token => {
                    this.toastr.success("The token has been saved", "Save Token");
                    if (this.isNew) this.router.navigate(["../", token.indicatorId, token.tokenNumber], { relativeTo: this.route });
                },
                error: err => {
                    this.errorService.handleError(err, "Token", "Save");
                }
            });

    }

    delete(): void {

        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Token", text: "Are you sure you want to delete this token?", deleteStyle: true, ok: "Delete" } as ConfirmModalOptions;
        modalRef.result.then(
            () => {

                this.tokenService.delete(this.token.indicatorId, this.token.tokenNumber)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The token has been deleted", "Delete Token");
                            this.router.navigate(["../../"], { relativeTo: this.route });
                        },
                        error: err => {
                            this.errorService.handleError(err, "Token", "Delete");
                        }
                    });

            }, () => { });
    }

    changeBreadcrumb(): void {
        this.breadcrumbService.changeBreadcrumb(this.route.snapshot, this.token.indicatorId ? this.token.indicator?.name?.substring(0, 25) : "(new token)");
    }

}
