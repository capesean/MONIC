import { Component as NgComponent, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmModalComponent, ConfirmModalOptions } from '../../common/components/confirm.component';
import { ComponentIndicator } from '../../common/models/componentindicator.model';
import { BreadcrumbService } from '../../common/services/breadcrumb.service';
import { ErrorService } from '../../common/services/error.service';
import { ComponentIndicatorService } from '../../common/services/componentindicator.service';

@NgComponent({
    selector: 'componentindicator-edit',
    templateUrl: './componentindicator.edit.component.html',
    standalone: false
})
export class ComponentIndicatorEditComponent implements OnInit {

    public componentIndicator: ComponentIndicator = new ComponentIndicator();
    public isNew = true;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private toastr: ToastrService,
        private breadcrumbService: BreadcrumbService,
        private modalService: NgbModal,
        private componentIndicatorService: ComponentIndicatorService,
        private errorService: ErrorService
    ) {
    }

    ngOnInit(): void {

        this.route.params.subscribe(params => {

            const indicatorId = params["indicatorId"];
            this.componentIndicator.componentId = this.route.snapshot.parent.params.componentId;
            this.isNew = indicatorId === "add";

            if (!this.isNew) {

                this.componentIndicator.indicatorId = indicatorId;
                this.loadComponentIndicator();

            }

        });

    }

    private loadComponentIndicator(): void {

        this.componentIndicatorService.get(this.componentIndicator.componentId, this.componentIndicator.indicatorId)
            .subscribe({
                next: componentIndicator => {
                    this.componentIndicator = componentIndicator;
                    this.changeBreadcrumb();
                },
                error: err => {
                    this.errorService.handleError(err, "Component Indicator", "Load");
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

        this.componentIndicatorService.save(this.componentIndicator)
            .subscribe({
                next: componentIndicator => {
                    this.toastr.success("The component indicator has been saved", "Save Component Indicator");
                    if (this.isNew) this.router.navigate(["../", componentIndicator.indicatorId], { relativeTo: this.route });
                },
                error: err => {
                    this.errorService.handleError(err, "Component Indicator", "Save");
                }
            });

    }

    delete(): void {

        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Component Indicator", text: "Are you sure you want to delete this component indicator?", deleteStyle: true, ok: "Delete" } as ConfirmModalOptions;
        modalRef.result.then(
            () => {

                this.componentIndicatorService.delete(this.componentIndicator.componentId, this.componentIndicator.indicatorId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The component indicator has been deleted", "Delete Component Indicator");
                            this.router.navigate(["../../"], { relativeTo: this.route });
                        },
                        error: err => {
                            this.errorService.handleError(err, "Component Indicator", "Delete");
                        }
                    });

            }, () => { });
    }

    changeBreadcrumb(): void {
        this.breadcrumbService.changeBreadcrumb(this.route.snapshot, this.componentIndicator.indicatorId ? this.componentIndicator.indicator?.name?.substring(0, 25) : "(new component indicator)");
    }

}
