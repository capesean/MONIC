import { Component as NgComponent, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmModalComponent, ConfirmModalOptions } from '../../common/components/confirm.component';
import { LogFrameRowComponent } from '../../common/models/logframerowcomponent.model';
import { BreadcrumbService } from '../../common/services/breadcrumb.service';
import { ErrorService } from '../../common/services/error.service';
import { LogFrameRowComponentService } from '../../common/services/logframerowcomponent.service';

@NgComponent({
    selector: 'logframerowcomponent-edit',
    templateUrl: './logframerowcomponent.edit.component.html',
    standalone: false
})
export class LogFrameRowComponentEditComponent implements OnInit {

    public logFrameRowComponent: LogFrameRowComponent = new LogFrameRowComponent();
    public isNew = true;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private toastr: ToastrService,
        private breadcrumbService: BreadcrumbService,
        private modalService: NgbModal,
        private logFrameRowComponentService: LogFrameRowComponentService,
        private errorService: ErrorService
    ) {
    }

    ngOnInit(): void {

        this.route.params.subscribe(params => {

            const componentId = params["componentId"];
            this.logFrameRowComponent.logFrameRowId = this.route.snapshot.parent.params.logFrameRowId;
            this.isNew = componentId === "add";

            if (!this.isNew) {

                this.logFrameRowComponent.componentId = componentId;
                this.loadLogFrameRowComponent();

            }

        });

    }

    private loadLogFrameRowComponent(): void {

        this.logFrameRowComponentService.get(this.logFrameRowComponent.logFrameRowId, this.logFrameRowComponent.componentId)
            .subscribe({
                next: logFrameRowComponent => {
                    this.logFrameRowComponent = logFrameRowComponent;
                    this.changeBreadcrumb();
                },
                error: err => {
                    this.errorService.handleError(err, "Log Frame Row Component", "Load");
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

        this.logFrameRowComponentService.save(this.logFrameRowComponent)
            .subscribe({
                next: logFrameRowComponent => {
                    this.toastr.success("The log frame row component has been saved", "Save Log Frame Row Component");
                    if (this.isNew) this.router.navigate(["../", logFrameRowComponent.componentId], { relativeTo: this.route });
                },
                error: err => {
                    this.errorService.handleError(err, "Log Frame Row Component", "Save");
                }
            });

    }

    delete(): void {

        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Log Frame Row Component", text: "Are you sure you want to delete this log frame row component?", deleteStyle: true, ok: "Delete" } as ConfirmModalOptions;
        modalRef.result.then(
            () => {

                this.logFrameRowComponentService.delete(this.logFrameRowComponent.logFrameRowId, this.logFrameRowComponent.componentId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The log frame row component has been deleted", "Delete Log Frame Row Component");
                            this.router.navigate(["../../"], { relativeTo: this.route });
                        },
                        error: err => {
                            this.errorService.handleError(err, "Log Frame Row Component", "Delete");
                        }
                    });

            }, () => { });
    }

    changeBreadcrumb(): void {
        this.breadcrumbService.changeBreadcrumb(this.route.snapshot, this.logFrameRowComponent.componentId ? this.logFrameRowComponent.component?.name?.substring(0, 25) : "(new log frame row component)");
    }

}
