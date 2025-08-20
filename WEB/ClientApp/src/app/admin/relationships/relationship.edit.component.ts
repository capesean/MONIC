import { Component as NgComponent, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmModalComponent, ConfirmModalOptions } from '../../common/components/confirm.component';
import { Relationship } from '../../common/models/relationship.model';
import { BreadcrumbService } from '../../common/services/breadcrumb.service';
import { ErrorService } from '../../common/services/error.service';
import { RelationshipService } from '../../common/services/relationship.service';
import { ItemComponent } from '../../common/components/item.component';
import { AppService } from '../../common/services/app.service';
import { DocumentService } from '../../common/services/document.service';
import { ItemTypes } from '../../common/models/enums.model';
import { Item } from '../../common/models/item.model';
import { FieldValueMapperService } from '../../common/services/field-value-mapper.service';
import { FadeThenShrink } from '../../common/animations/fadethenshrink';

@NgComponent({
    selector: 'relationship-edit',
    templateUrl: './relationship.edit.component.html',
    standalone: false,
    animations: [FadeThenShrink]
})
export class RelationshipEditComponent extends ItemComponent implements OnInit {

    public relationship: Relationship = new Relationship();
    public isNew = true;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private toastr: ToastrService,
        private breadcrumbService: BreadcrumbService,
        protected modalService: NgbModal,
        private relationshipService: RelationshipService,
        protected errorService: ErrorService,
        protected cdref: ChangeDetectorRef,
        protected appService: AppService,
        protected documentService: DocumentService,
        protected fieldValueMapper: FieldValueMapperService
    ) {
        super(appService, errorService, cdref, documentService, modalService, fieldValueMapper);
    }

    ngOnInit(): void {

        this.route.params.subscribe(params => {

            const relationshipId = params["relationshipId"];
            this.relationship.theoryOfChangeId = this.route.snapshot.parent.params.theoryOfChangeId;
            this.isNew = relationshipId === "add";

            if (!this.isNew) {

                this.relationship.relationshipId = relationshipId;
                this.loadRelationship();

            } else {
                this.setItem(this.relationship, {
                    itemType: ItemTypes.Relationship,
                    itemId: this.relationship.relationshipId
                } as Item);
            }

        });

    }

    private loadRelationship(): void {

        this.relationshipService.get(this.relationship.relationshipId)
            .subscribe({
                next: relationship => {
                    this.relationship = relationship;
                    this.changeBreadcrumb();
                    this.setItem(this.relationship, {
                        itemType: ItemTypes.Relationship,
                        itemId: this.relationship.relationshipId
                    } as Item);
                    this.searchDocuments();
                },
                error: err => {
                    this.errorService.handleError(err, "Relationship", "Load");
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

        this.getData(this.relationship);

        this.relationshipService.save(this.relationship)
            .subscribe({
                next: relationship => {
                    this.toastr.success("The relationship has been saved", "Save Relationship");
                    if (this.isNew) {
                        this.router.navigate(["../", relationship.relationshipId], { relativeTo: this.route });
                    } else {
                        this.relationship = relationship;
                        this.setItem(this.relationship, {
                            itemType: ItemTypes.Relationship,
                            itemId: this.relationship.relationshipId
                        } as Item);
                    }
                },
                error: err => {
                    this.errorService.handleError(err, "Relationship", "Save");
                }
            });

    }

    delete(): void {

        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Relationship", text: "Are you sure you want to delete this relationship?", deleteStyle: true, ok: "Delete" } as ConfirmModalOptions;
        modalRef.result.then(
            () => {

                this.relationshipService.delete(this.relationship.relationshipId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The relationship has been deleted", "Delete Relationship");
                            this.router.navigate(["../../"], { relativeTo: this.route });
                        },
                        error: err => {
                            this.errorService.handleError(err, "Relationship", "Delete");
                        }
                    });

            }, () => { });
    }

    changeBreadcrumb(): void {
        this.breadcrumbService.changeBreadcrumb(this.route.snapshot, this.relationship.targetComponentId ? this.relationship.targetComponent?.name?.substring(0, 25) : "(new relationship)");
    }

}
