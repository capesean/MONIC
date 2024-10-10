import { Component as NgComponent, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmModalComponent, ConfirmModalOptions } from '../../common/components/confirm.component';
import { PagingHeaders } from '../../common/models/http.model';
import { TheoryOfChange } from '../../common/models/theoryofchange.model';
import { BreadcrumbService } from '../../common/services/breadcrumb.service';
import { ErrorService } from '../../common/services/error.service';
import { TheoryOfChangeService } from '../../common/services/theoryofchange.service';
import { Relationship, RelationshipSearchOptions, RelationshipSearchResponse } from '../../common/models/relationship.model';
import { RelationshipService } from '../../common/services/relationship.service';
import { TheoryOfChangeComponent, TheoryOfChangeComponentSearchOptions, TheoryOfChangeComponentSearchResponse } from '../../common/models/theoryofchangecomponent.model';
import { TheoryOfChangeComponentService } from '../../common/services/theoryofchangecomponent.service';
import { ComponentModalComponent } from '../components/component.modal.component';
import { Component } from '../../common/models/component.model';

@NgComponent({
    selector: 'theoryofchange-edit',
    templateUrl: './theoryofchange.edit.component.html'
})
export class TheoryOfChangeEditComponent implements OnInit, OnDestroy {

    public theoryOfChange: TheoryOfChange = new TheoryOfChange();
    public isNew = true;
    private routerSubscription: Subscription;

    public theoryOfChangeComponentsSearchOptions = new TheoryOfChangeComponentSearchOptions();
    public theoryOfChangeComponentsHeaders = new PagingHeaders();
    public theoryOfChangeComponents: TheoryOfChangeComponent[] = [];
    public showTheoryOfChangeComponentsSearch = false;

    public relationshipsSearchOptions = new RelationshipSearchOptions();
    public relationshipsHeaders = new PagingHeaders();
    public relationships: Relationship[] = [];
    public showRelationshipsSearch = false;

    @ViewChild('componentModal') componentModal: ComponentModalComponent;

    constructor(
        private router: Router,
        public route: ActivatedRoute,
        private toastr: ToastrService,
        private breadcrumbService: BreadcrumbService,
        private modalService: NgbModal,
        private theoryOfChangeService: TheoryOfChangeService,
        private relationshipService: RelationshipService,
        private theoryOfChangeComponentService: TheoryOfChangeComponentService,
        private errorService: ErrorService
    ) {
    }

    ngOnInit(): void {

        this.route.params.subscribe(params => {

            const theoryOfChangeId = params["theoryOfChangeId"];
            this.isNew = theoryOfChangeId === "add";

            if (!this.isNew) {

                this.theoryOfChange.theoryOfChangeId = theoryOfChangeId;
                this.loadTheoryOfChange();

                this.theoryOfChangeComponentsSearchOptions.theoryOfChangeId = theoryOfChangeId;
                this.theoryOfChangeComponentsSearchOptions.includeParents = true;
                this.searchTheoryOfChangeComponents();

                this.relationshipsSearchOptions.theoryOfChangeId = theoryOfChangeId;
                this.relationshipsSearchOptions.includeParents = true;
                this.searchRelationships();

            }

            this.routerSubscription = this.router.events.subscribe(event => {
                if (event instanceof NavigationEnd && !this.route.firstChild) {
                    // this will double-load on new save, as params change (above) + nav ends
                    this.searchTheoryOfChangeComponents();
                    this.searchRelationships();
                }
            });

        });

    }

    ngOnDestroy(): void {
        this.routerSubscription.unsubscribe();
    }

    private loadTheoryOfChange(): void {

        this.theoryOfChangeService.get(this.theoryOfChange.theoryOfChangeId)
            .subscribe({
                next: theoryOfChange => {
                    this.theoryOfChange = theoryOfChange;
                    this.changeBreadcrumb();
                },
                error: err => {
                    this.errorService.handleError(err, "Theory of Change", "Load");
                    if (err instanceof HttpErrorResponse && err.status === 404)
                        this.router.navigate(["../"], { relativeTo: this.route });
                }
            });

    }

    save(form: NgForm): void {

        if (form.invalid) {

            this.toastr.error("The form has not been completed correctly.", "Form Error");
            return;

        }

        this.theoryOfChangeService.save(this.theoryOfChange)
            .subscribe({
                next: theoryOfChange => {
                    this.toastr.success("The theory of change has been saved", "Save Theory of Change");
                    if (this.isNew) {
                        this.ngOnDestroy();
                        this.router.navigate(["../", theoryOfChange.theoryOfChangeId], { relativeTo: this.route });
                    }
                },
                error: err => {
                    this.errorService.handleError(err, "Theory of Change", "Save");
                }
            });

    }

    delete(): void {

        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Theory of Change", text: "Are you sure you want to delete this theory of change?", deleteStyle: true, ok: "Delete" } as ConfirmModalOptions;
        modalRef.result.then(
            () => {

                this.theoryOfChangeService.delete(this.theoryOfChange.theoryOfChangeId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The theory of change has been deleted", "Delete Theory of Change");
                            this.router.navigate(["../"], { relativeTo: this.route });
                        },
                        error: err => {
                            this.errorService.handleError(err, "Theory of Change", "Delete");
                        }
                    });

            }, () => { });
    }

    changeBreadcrumb(): void {
        this.breadcrumbService.changeBreadcrumb(this.route.snapshot, this.theoryOfChange.name !== undefined ? this.theoryOfChange.name.substring(0, 25) : "(new theory of change)");
    }

    searchTheoryOfChangeComponents(pageIndex = 0): Subject<TheoryOfChangeComponentSearchResponse> {

        this.theoryOfChangeComponentsSearchOptions.pageIndex = pageIndex;

        const subject = new Subject<TheoryOfChangeComponentSearchResponse>()

        this.theoryOfChangeComponentService.search(this.theoryOfChangeComponentsSearchOptions)
            .subscribe({
                next: response => {
                    subject.next(response);
                    this.theoryOfChangeComponents = response.theoryOfChangeComponents;
                    this.theoryOfChangeComponentsHeaders = response.headers;
                },
                error: err => {
                    this.errorService.handleError(err, "Components", "Load");
                }
            });

        return subject;

    }

    goToTheoryOfChangeComponent(theoryOfChangeComponent: TheoryOfChangeComponent): void {
        this.router.navigate(["theoryofchangecomponents", theoryOfChangeComponent.componentId], { relativeTo: this.route });
    }

    addTheoryOfChangeComponents(): void {
        this.componentModal.open();
    }

    changeComponent(components: Component[]): void {
        if (!components.length) return;
        const componentIdList = components.map(o => o.componentId);
        this.theoryOfChangeService.saveTheoryOfChangeComponents(this.theoryOfChange.theoryOfChangeId, componentIdList)
            .subscribe({
                next: () => {
                    this.toastr.success("The theory of change components have been saved", "Save Theory of Change Components");
                    this.searchTheoryOfChangeComponents(this.theoryOfChangeComponentsHeaders.pageIndex);
                },
                error: err => {
                    this.errorService.handleError(err, "Theory of Change Components", "Save");
                }
            });
    }

    deleteTheoryOfChangeComponent(theoryOfChangeComponent: TheoryOfChangeComponent, event: MouseEvent): void {
        event.stopPropagation();

        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Theory of Change Component", text: "Are you sure you want to delete this theory of change component?", deleteStyle: true, ok: "Delete" } as ConfirmModalOptions;
        modalRef.result.then(
            () => {

                this.theoryOfChangeComponentService.delete(theoryOfChangeComponent.theoryOfChangeId, theoryOfChangeComponent.componentId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The theory of change component has been deleted", "Delete Theory of Change Component");
                            this.searchTheoryOfChangeComponents(this.theoryOfChangeComponentsHeaders.pageIndex);
                        },
                        error: err => {
                            this.errorService.handleError(err, "Theory of Change Component", "Delete");
                        }
                    });

            }, () => { });
    }

    deleteTheoryOfChangeComponents(): void {
        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Components", text: "Are you sure you want to delete all the components?", deleteStyle: true, ok: "Delete" } as ConfirmModalOptions;
        modalRef.result.then(
            () => {

                this.theoryOfChangeService.deleteTheoryOfChangeComponents(this.theoryOfChange.theoryOfChangeId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The components have been deleted", "Delete Components");
                            this.searchTheoryOfChangeComponents();
                        },
                        error: err => {
                            this.errorService.handleError(err, "Components", "Delete");
                        }
                    });
            }, () => { });

    }

    searchRelationships(pageIndex = 0): Subject<RelationshipSearchResponse> {

        this.relationshipsSearchOptions.pageIndex = pageIndex;

        const subject = new Subject<RelationshipSearchResponse>()

        this.relationshipService.search(this.relationshipsSearchOptions)
            .subscribe({
                next: response => {
                    subject.next(response);
                    this.relationships = response.relationships;
                    this.relationshipsHeaders = response.headers;
                },
                error: err => {
                    this.errorService.handleError(err, "Relationships", "Load");
                }
            });

        return subject;

    }

    goToRelationship(relationship: Relationship): void {
        this.router.navigate(["relationships", relationship.relationshipId], { relativeTo: this.route });
    }

    deleteRelationship(relationship: Relationship, event: MouseEvent): void {
        event.stopPropagation();

        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Relationship", text: "Are you sure you want to delete this relationship?", deleteStyle: true, ok: "Delete" } as ConfirmModalOptions;
        modalRef.result.then(
            () => {

                this.relationshipService.delete(relationship.relationshipId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The relationship has been deleted", "Delete Relationship");
                            this.searchRelationships(this.relationshipsHeaders.pageIndex);
                        },
                        error: err => {
                            this.errorService.handleError(err, "Relationship", "Delete");
                        }
                    });

            }, () => { });
    }

    deleteRelationships(): void {
        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Relationships", text: "Are you sure you want to delete all the relationships?", deleteStyle: true, ok: "Delete" } as ConfirmModalOptions;
        modalRef.result.then(
            () => {

                this.theoryOfChangeService.deleteRelationships(this.theoryOfChange.theoryOfChangeId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The relationships have been deleted", "Delete Relationships");
                            this.searchRelationships();
                        },
                        error: err => {
                            this.errorService.handleError(err, "Relationships", "Delete");
                        }
                    });
            }, () => { });

    }

}
