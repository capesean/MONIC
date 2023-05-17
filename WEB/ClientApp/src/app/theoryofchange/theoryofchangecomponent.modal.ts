import { Component as NgComponent, ChangeDetectorRef, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ErrorService } from '../common/services/error.service';
import { NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Component } from '../common/models/component.model';
import { ComponentService } from '../common/services/component.service';
import { Enum, Enums, ItemTypes } from '../common/models/enums.model';
import { AppService } from '../common/services/app.service';
import { DocumentService } from '../common/services/document.service';
import { ItemComponent } from '../common/components/item.component';
import { Item } from '../common/models/item.model';
import { TheoryOfChange } from '../common/models/theoryofchange.model';
import { TheoryOfChangeComponentService } from '../common/services/theoryofchangecomponent.service';
import { TheoryOfChangeComponent } from '../common/models/theoryofchangecomponent.model';
import { ConfirmModalComponent, ModalOptions } from '../common/components/confirm.component';

@NgComponent({
    selector: 'theoryofchangecomponent-modal',
    templateUrl: './theoryofchangecomponent.modal.html'
})
export class TheoryOfChangeComponentModal extends ItemComponent implements OnInit {

    public theoryOfChange: TheoryOfChange;
    public component: Component;
    public isNew = true;
    public componentTypes: Enum[] = Enums.ComponentTypes;

    constructor(
        public modal: NgbActiveModal,
        private componentService: ComponentService,
        private toastr: ToastrService,
        protected errorService: ErrorService,
        protected modalService: NgbModal,
        protected cdref: ChangeDetectorRef,
        protected appService: AppService,
        protected documentService: DocumentService,
        private theoryOfChangeComponentService: TheoryOfChangeComponentService
    ) {
        super(appService, errorService, cdref, documentService, modalService);
    }

    ngOnInit(): void {
    }

    public setComponent(theoryOfChange: TheoryOfChange, component: Component) {
        this.theoryOfChange = theoryOfChange;
        if (component == undefined) {
            this.component = new Component();
        } else {
            this.isNew = false;
            // clone to avoid cancelled changes affecting source page
            this.component = { ...component };
            //this.component.children = [...component.children];
        }
        this.setItem(this.component, { itemType: ItemTypes.Component, itemId: this.component.componentId } as Item);
        this.searchDocuments();
    }

    save(form: NgForm): void {

        if (form.invalid) {

            this.toastr.error("The form has not been completed correctly.", "Form Error");
            return;

        }

        this.getData(this.component);

        this.componentService.save(this.component)
            .subscribe({
                next: lfr => {

                    this.theoryOfChangeComponentService.save(
                        {
                            componentId: lfr.componentId,
                            theoryOfChangeId: this.theoryOfChange.theoryOfChangeId
                        } as TheoryOfChangeComponent
                    ).subscribe({
                        next: () => {
                            this.toastr.success("The Component has been saved", "Save Component");
                            this.modal.close(lfr);
                        },
                        error: () => {
                            this.toastr.error("The Component was saved but could not be added to the Theory of Change model", "Add Component");
                        }
                    });
                },
                error: err => {
                    this.errorService.handleError(err, "Component", "Save");
                }
            });

    }

    remove(): void {

        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Remove Component", text: "Are you sure you want to remove this Component from the Theory of Change model?", deleteStyle: true, ok: "Remove" } as ModalOptions;
        modalRef.result.then(
            () => {

                this.theoryOfChangeComponentService.delete(this.theoryOfChange.theoryOfChangeId, this.component.componentId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The Component has been removed from the Theory of Change", "Remove Component");
                            this.modal.close("removed");
                        },
                        error: err => {
                            this.errorService.handleError(err, "Component", "Remove");
                        }
                    });

            }, () => { });

    }

    delete(): void {

        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Component", text: "<p>Are you sure you want to delete this Component?</p><p>Deleting the component will remove it from the Theory of Change model <strong class='text-danger'>as well as deleting it from the database</strong>.</p>", deleteStyle: true, ok: "Delete" } as ModalOptions;
        modalRef.result.then(
            () => {

                this.componentService.delete(this.component.componentId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The Component has been deleted", "Delete Component");
                            this.modal.close("deleted");
                        },
                        error: err => {
                            this.errorService.handleError(err, "Component", "Delete");
                        }
                    });

            }, () => { });

    }
}
