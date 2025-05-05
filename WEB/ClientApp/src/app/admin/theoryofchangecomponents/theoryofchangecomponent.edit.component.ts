import { Component as NgComponent, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmModalComponent, ConfirmModalOptions } from '../../common/components/confirm.component';
import { TheoryOfChangeComponent } from '../../common/models/theoryofchangecomponent.model';
import { BreadcrumbService } from '../../common/services/breadcrumb.service';
import { ErrorService } from '../../common/services/error.service';
import { TheoryOfChangeComponentService } from '../../common/services/theoryofchangecomponent.service';

@NgComponent({
    selector: 'theoryofchangecomponent-edit',
    templateUrl: './theoryofchangecomponent.edit.component.html',
    standalone: false
})
export class TheoryOfChangeComponentEditComponent implements OnInit {

    public theoryOfChangeComponent: TheoryOfChangeComponent = new TheoryOfChangeComponent();
    public isNew = true;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private toastr: ToastrService,
        private breadcrumbService: BreadcrumbService,
        private modalService: NgbModal,
        private theoryOfChangeComponentService: TheoryOfChangeComponentService,
        private errorService: ErrorService
    ) {
    }

    ngOnInit(): void {

        this.route.params.subscribe(params => {

            const componentId = params["componentId"];
            this.theoryOfChangeComponent.theoryOfChangeId = this.route.snapshot.parent.params.theoryOfChangeId;
            this.isNew = componentId === "add";

            if (!this.isNew) {

                this.theoryOfChangeComponent.componentId = componentId;
                this.loadTheoryOfChangeComponent();

            }

        });

    }

    private loadTheoryOfChangeComponent(): void {

        this.theoryOfChangeComponentService.get(this.theoryOfChangeComponent.theoryOfChangeId, this.theoryOfChangeComponent.componentId)
            .subscribe({
                next: theoryOfChangeComponent => {
                    this.theoryOfChangeComponent = theoryOfChangeComponent;
                    this.changeBreadcrumb();
                },
                error: err => {
                    this.errorService.handleError(err, "Theory of Change Component", "Load");
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

        this.theoryOfChangeComponentService.save(this.theoryOfChangeComponent)
            .subscribe({
                next: theoryOfChangeComponent => {
                    this.toastr.success("The theory of change component has been saved", "Save Theory of Change Component");
                    if (this.isNew) this.router.navigate(["../", theoryOfChangeComponent.componentId], { relativeTo: this.route });
                },
                error: err => {
                    this.errorService.handleError(err, "Theory of Change Component", "Save");
                }
            });

    }

    delete(): void {

        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Theory of Change Component", text: "Are you sure you want to delete this theory of change component?", deleteStyle: true, ok: "Delete" } as ConfirmModalOptions;
        modalRef.result.then(
            () => {

                this.theoryOfChangeComponentService.delete(this.theoryOfChangeComponent.theoryOfChangeId, this.theoryOfChangeComponent.componentId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The theory of change component has been deleted", "Delete Theory of Change Component");
                            this.router.navigate(["../../"], { relativeTo: this.route });
                        },
                        error: err => {
                            this.errorService.handleError(err, "Theory of Change Component", "Delete");
                        }
                    });

            }, () => { });
    }

    changeBreadcrumb(): void {
        this.breadcrumbService.changeBreadcrumb(this.route.snapshot, this.theoryOfChangeComponent.componentId ? this.theoryOfChangeComponent.component?.name?.substring(0, 25) : "(new theory of change component)");
    }

}
