import { Component as NgComponent, OnInit, ChangeDetectorRef } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ErrorService } from '../common/services/error.service';
import { NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ItemTypes } from '../common/models/enums.model';
import { AppService } from '../common/services/app.service';
import { DocumentService } from '../common/services/document.service';
import { ItemComponent } from '../common/components/item.component';
import { Item } from '../common/models/item.model';
import { TheoryOfChange } from '../common/models/theoryofchange.model';
import { ConfirmModalComponent, ConfirmModalOptions } from '../common/components/confirm.component';
import { Relationship } from '../common/models/relationship.model';
import { RelationshipService } from '../common/services/relationship.service';
import { Component } from '../common/models/component.model';

@NgComponent({
    selector: 'theoryofchangerelationship-modal',
    templateUrl: './theoryofchangerelationship.modal.html',
    standalone: false
})
export class TheoryOfChangeRelationshipModal extends ItemComponent implements OnInit {

    public theoryOfChange: TheoryOfChange;
    public relationship: Relationship;
    public isNew = true;

    constructor(
        public modal: NgbActiveModal,
        private relationshipService: RelationshipService,
        private toastr: ToastrService,
        protected errorService: ErrorService,
        protected modalService: NgbModal,
        protected cdref: ChangeDetectorRef,
        protected appService: AppService,
        protected documentService: DocumentService
    ) {
        super(appService, errorService, cdref, documentService, modalService);
    }

    ngOnInit(): void {
    }

    public setRelationship(theoryOfChange: TheoryOfChange, relationship: Relationship, sourceComponent?: Component, targetComponent?: Component) {
        this.theoryOfChange = theoryOfChange;
        if (relationship == undefined) {
            this.relationship = new Relationship();
            this.relationship.theoryOfChangeId = theoryOfChange.theoryOfChangeId;
            this.relationship.sourceComponent = sourceComponent;
            this.relationship.sourceComponentId = sourceComponent.componentId;
            this.relationship.targetComponent = targetComponent;
            this.relationship.targetComponentId = targetComponent.componentId;
            this.relationship.fieldValues = [];
            this.relationship.optionValues = [];
        } else {
            this.isNew = false;
            // clone to avoid cancelled changes affecting source page
            this.relationship = { ...relationship };
            //this.relationship.children = [...relationship.children];
        }
        this.setItem(this.relationship, { itemType: ItemTypes.Relationship, itemId: this.relationship.relationshipId } as Item);
        this.searchDocuments();
    }

    save(form: NgForm): void {

        if (form.invalid) {

            this.toastr.error("The form has not been completed correctly.", "Form Error");
            return;

        }

        this.getData(this.relationship);

        this.relationshipService.save(this.relationship)
            .subscribe({
                next: lr => {

                    this.toastr.success("The Relationship has been saved", "Save Relationship");
                    this.modal.close(lr);

                },
                error: err => {
                    this.errorService.handleError(err, "Relationship", "Save");
                }
            });

    }

    delete(): void {

        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Relationship", text: "Are you sure you want to delete this Relationship?", deleteStyle: true, ok: "Delete" } as ConfirmModalOptions;
        modalRef.result.then(
            () => {

                this.relationshipService.delete(this.relationship.relationshipId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The Relationship has been deleted", "Delete Relationship");
                            this.modal.close("deleted");
                        },
                        error: err => {
                            this.errorService.handleError(err, "Relationship", "Delete");
                        }
                    });

            }, () => { });

    }
}
