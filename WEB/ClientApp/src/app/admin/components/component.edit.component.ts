import { Component as NgComponent, OnInit, OnDestroy, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmModalComponent, ModalOptions } from '../../common/components/confirm.component';
import { PagingHeaders } from '../../common/models/http.model';
import { Component } from '../../common/models/component.model';
import { Enum, Enums, ItemTypes } from '../../common/models/enums.model';
import { BreadcrumbService } from '../../common/services/breadcrumb.service';
import { ErrorService } from '../../common/services/error.service';
import { ComponentService } from '../../common/services/component.service';
import { ComponentIndicator, ComponentIndicatorSearchOptions, ComponentIndicatorSearchResponse } from '../../common/models/componentindicator.model';
import { ComponentIndicatorService } from '../../common/services/componentindicator.service';
import { LogFrameRowComponent, LogFrameRowComponentSearchOptions, LogFrameRowComponentSearchResponse } from '../../common/models/logframerowcomponent.model';
import { LogFrameRowComponentService } from '../../common/services/logframerowcomponent.service';
import { Relationship, RelationshipSearchOptions, RelationshipSearchResponse } from '../../common/models/relationship.model';
import { RelationshipService } from '../../common/services/relationship.service';
import { TheoryOfChangeComponent, TheoryOfChangeComponentSearchOptions, TheoryOfChangeComponentSearchResponse } from '../../common/models/theoryofchangecomponent.model';
import { TheoryOfChangeComponentService } from '../../common/services/theoryofchangecomponent.service';
import { TheoryOfChangeModalComponent } from '../theoriesofchange/theoryofchange.modal.component';
import { TheoryOfChange } from '../../common/models/theoryofchange.model';
import { IndicatorModalComponent } from '../indicators/indicator.modal.component';
import { Indicator } from '../../common/models/indicator.model';
import { ItemComponent } from '../../common/components/item.component';
import { AppService } from '../../common/services/app.service';
import { DocumentService } from '../../common/services/document.service';
import { Item } from '../../common/models/item.model';

@NgComponent({
    selector: 'component-edit',
    templateUrl: './component.edit.component.html'
})
export class ComponentEditComponent extends ItemComponent implements OnInit, OnDestroy {

    public component: Component = new Component();
    public isNew = true;
    private routerSubscription: Subscription;
    public componentTypes: Enum[] = Enums.ComponentTypes;

    public relationshipsAsSourceSearchOptions = new RelationshipSearchOptions();
    public relationshipsAsSourceHeaders = new PagingHeaders();
    public relationshipsAsSource: Relationship[] = [];
    public showRelationshipsAsSourceSearch = false;

    public relationshipsAsTargetSearchOptions = new RelationshipSearchOptions();
    public relationshipsAsTargetHeaders = new PagingHeaders();
    public relationshipsAsTarget: Relationship[] = [];
    public showRelationshipsAsTargetSearch = false;

    public logFrameRowComponentsSearchOptions = new LogFrameRowComponentSearchOptions();
    public logFrameRowComponentsHeaders = new PagingHeaders();
    public logFrameRowComponents: LogFrameRowComponent[] = [];
    public showLogFrameRowComponentsSearch = false;

    public theoryOfChangeComponentsSearchOptions = new TheoryOfChangeComponentSearchOptions();
    public theoryOfChangeComponentsHeaders = new PagingHeaders();
    public theoryOfChangeComponents: TheoryOfChangeComponent[] = [];
    public showTheoryOfChangeComponentsSearch = false;

    public componentIndicatorsSearchOptions = new ComponentIndicatorSearchOptions();
    public componentIndicatorsHeaders = new PagingHeaders();
    public componentIndicators: ComponentIndicator[] = [];
    public showComponentIndicatorsSearch = false;

    @ViewChild('theoryOfChangeModal') theoryOfChangeModal: TheoryOfChangeModalComponent;
    @ViewChild('indicatorModal') indicatorModal: IndicatorModalComponent;

    constructor(
        private router: Router,
        public route: ActivatedRoute,
        private toastr: ToastrService,
        private breadcrumbService: BreadcrumbService,
        protected modalService: NgbModal,
        private componentService: ComponentService,
        private componentIndicatorService: ComponentIndicatorService,
        private logFrameRowComponentService: LogFrameRowComponentService,
        private relationshipService: RelationshipService,
        private theoryOfChangeComponentService: TheoryOfChangeComponentService,
        protected errorService: ErrorService,
        protected cdref: ChangeDetectorRef,
        protected appService: AppService,
        protected documentService: DocumentService
    ) {
        super(appService, errorService, cdref, documentService, modalService);
    }

    ngOnInit(): void {

        this.route.params.subscribe(params => {

            const componentId = params["componentId"];
            this.isNew = componentId === "add";

            if (!this.isNew) {

                this.component.componentId = componentId;
                this.loadComponent();

                this.relationshipsAsSourceSearchOptions.sourceComponentId = componentId;
                this.relationshipsAsSourceSearchOptions.includeParents = true;
                this.searchRelationshipsAsSource();

                this.relationshipsAsTargetSearchOptions.targetComponentId = componentId;
                this.relationshipsAsTargetSearchOptions.includeParents = true;
                this.searchRelationshipsAsTarget();

                this.logFrameRowComponentsSearchOptions.componentId = componentId;
                this.logFrameRowComponentsSearchOptions.includeParents = true;
                this.searchLogFrameRowComponents();

                this.theoryOfChangeComponentsSearchOptions.componentId = componentId;
                this.theoryOfChangeComponentsSearchOptions.includeParents = true;
                this.searchTheoryOfChangeComponents();

                this.componentIndicatorsSearchOptions.componentId = componentId;
                this.componentIndicatorsSearchOptions.includeParents = true;
                this.searchComponentIndicators();

            } else {
                this.setItem(this.component, { itemType: ItemTypes.Component, itemId: this.component.componentId } as Item);
            }

            this.routerSubscription = this.router.events.subscribe(event => {
                if (event instanceof NavigationEnd && !this.route.firstChild) {
                    // this will double-load on new save, as params change (above) + nav ends
                    this.searchComponentIndicators();
                }
            });

        });

    }

    ngOnDestroy(): void {
        this.routerSubscription.unsubscribe();
    }

    private loadComponent(): void {

        this.componentService.get(this.component.componentId)
            .subscribe({
                next: component => {
                    this.component = component;
                    this.changeBreadcrumb();
                    this.setItem(this.component, { itemType: ItemTypes.Component, itemId: this.component.componentId } as Item);
                    this.searchDocuments();
                },
                error: err => {
                    this.errorService.handleError(err, "Component", "Load");
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

        this.getData(this.component);

        this.componentService.save(this.component)
            .subscribe({
                next: component => {
                    this.toastr.success("The component has been saved", "Save Component");
                    if (this.isNew) {
                        this.ngOnDestroy();
                        this.router.navigate(["../", component.componentId], { relativeTo: this.route });
                    } else {
                        this.component = component;
                        this.setItem(this.component, { itemType: ItemTypes.Component, itemId: this.component.componentId } as Item);
                    }
                },
                error: err => {
                    this.errorService.handleError(err, "Component", "Save");
                }
            });

    }

    delete(): void {

        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Component", text: "Are you sure you want to delete this component?", deleteStyle: true, ok: "Delete" } as ModalOptions;
        modalRef.result.then(
            () => {

                this.componentService.delete(this.component.componentId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The component has been deleted", "Delete Component");
                            this.router.navigate(["../"], { relativeTo: this.route });
                        },
                        error: err => {
                            this.errorService.handleError(err, "Component", "Delete");
                        }
                    });

            }, () => { });
    }

    changeBreadcrumb(): void {
        this.breadcrumbService.changeBreadcrumb(this.route.snapshot, this.component.name !== undefined ? this.component.name.substring(0, 25) : "(new component)");
    }

    searchRelationshipsAsSource(pageIndex = 0): Subject<RelationshipSearchResponse> {

        this.relationshipsAsSourceSearchOptions.pageIndex = pageIndex;

        const subject = new Subject<RelationshipSearchResponse>()

        this.relationshipService.search(this.relationshipsAsSourceSearchOptions)
            .subscribe({
                next: response => {
                    subject.next(response);
                    this.relationshipsAsSource = response.relationships;
                    this.relationshipsAsSourceHeaders = response.headers;
                },
                error: err => {
                    this.errorService.handleError(err, "Relationships as Source", "Load");
                }
            });

        return subject;

    }

    goToRelationshipAsSource(relationship: Relationship): void {
        this.router.navigate(["/theoriesofchange", relationship.theoryOfChange.theoryOfChangeId, "relationships", relationship.relationshipId]);
    }

    deleteRelationshipAsSource(relationship: Relationship, event: MouseEvent): void {
        event.stopPropagation();

        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Relationship", text: "Are you sure you want to delete this relationship?", deleteStyle: true, ok: "Delete" } as ModalOptions;
        modalRef.result.then(
            () => {

                this.relationshipService.delete(relationship.relationshipId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The relationship has been deleted", "Delete Relationship");
                            this.searchRelationshipsAsSource(this.relationshipsAsSourceHeaders.pageIndex);
                        },
                        error: err => {
                            this.errorService.handleError(err, "Relationship", "Delete");
                        }
                    });

            }, () => { });
    }

    deleteRelationshipsAsSource(): void {
        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Relationships", text: "Are you sure you want to delete all the relationships as source?", deleteStyle: true, ok: "Delete" } as ModalOptions;
        modalRef.result.then(
            () => {

                this.componentService.deleteRelationshipsAsSource(this.component.componentId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The relationships as source have been deleted", "Delete Relationships as Source");
                            this.searchRelationshipsAsSource();
                        },
                        error: err => {
                            this.errorService.handleError(err, "Relationships as Source", "Delete");
                        }
                    });
            }, () => { });

    }

    searchRelationshipsAsTarget(pageIndex = 0): Subject<RelationshipSearchResponse> {

        this.relationshipsAsTargetSearchOptions.pageIndex = pageIndex;

        const subject = new Subject<RelationshipSearchResponse>()

        this.relationshipService.search(this.relationshipsAsTargetSearchOptions)
            .subscribe({
                next: response => {
                    subject.next(response);
                    this.relationshipsAsTarget = response.relationships;
                    this.relationshipsAsTargetHeaders = response.headers;
                },
                error: err => {
                    this.errorService.handleError(err, "Relationships as Target", "Load");
                }
            });

        return subject;

    }

    goToRelationshipAsTarget(relationship: Relationship): void {
        this.router.navigate(["/theoriesofchange", relationship.theoryOfChange.theoryOfChangeId, "relationships", relationship.relationshipId]);
    }

    deleteRelationshipAsTarget(relationship: Relationship, event: MouseEvent): void {
        event.stopPropagation();

        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Relationship", text: "Are you sure you want to delete this relationship?", deleteStyle: true, ok: "Delete" } as ModalOptions;
        modalRef.result.then(
            () => {

                this.relationshipService.delete(relationship.relationshipId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The relationship has been deleted", "Delete Relationship");
                            this.searchRelationshipsAsTarget(this.relationshipsAsTargetHeaders.pageIndex);
                        },
                        error: err => {
                            this.errorService.handleError(err, "Relationship", "Delete");
                        }
                    });

            }, () => { });
    }

    deleteRelationshipsAsTarget(): void {
        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Relationships", text: "Are you sure you want to delete all the relationships as target?", deleteStyle: true, ok: "Delete" } as ModalOptions;
        modalRef.result.then(
            () => {

                this.componentService.deleteRelationshipsAsTarget(this.component.componentId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The relationships as target have been deleted", "Delete Relationships as Target");
                            this.searchRelationshipsAsTarget();
                        },
                        error: err => {
                            this.errorService.handleError(err, "Relationships as Target", "Delete");
                        }
                    });
            }, () => { });

    }

    searchLogFrameRowComponents(pageIndex = 0): Subject<LogFrameRowComponentSearchResponse> {

        this.logFrameRowComponentsSearchOptions.pageIndex = pageIndex;

        const subject = new Subject<LogFrameRowComponentSearchResponse>()

        this.logFrameRowComponentService.search(this.logFrameRowComponentsSearchOptions)
            .subscribe({
                next: response => {
                    subject.next(response);
                    this.logFrameRowComponents = response.logFrameRowComponents;
                    this.logFrameRowComponentsHeaders = response.headers;
                },
                error: err => {
                    this.errorService.handleError(err, "Log Frame Row Components", "Load");
                }
            });

        return subject;

    }

    goToLogFrameRowComponent(logFrameRowComponent: LogFrameRowComponent): void {
        this.router.navigate(["/logframes", logFrameRowComponent.logFrameRow.logFrame.logFrameId, "logframerows", logFrameRowComponent.logFrameRow.logFrameRowId, "logframerowcomponents", logFrameRowComponent.componentId]);
    }

    deleteLogFrameRowComponent(logFrameRowComponent: LogFrameRowComponent, event: MouseEvent): void {
        event.stopPropagation();

        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Log Frame Row Component", text: "Are you sure you want to delete this log frame row component?", deleteStyle: true, ok: "Delete" } as ModalOptions;
        modalRef.result.then(
            () => {

                this.logFrameRowComponentService.delete(logFrameRowComponent.logFrameRowId, logFrameRowComponent.componentId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The log frame row component has been deleted", "Delete Log Frame Row Component");
                            this.searchLogFrameRowComponents(this.logFrameRowComponentsHeaders.pageIndex);
                        },
                        error: err => {
                            this.errorService.handleError(err, "Log Frame Row Component", "Delete");
                        }
                    });

            }, () => { });
    }

    deleteLogFrameRowComponents(): void {
        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Log Frame Row Components", text: "Are you sure you want to delete all the log frame row components?", deleteStyle: true, ok: "Delete" } as ModalOptions;
        modalRef.result.then(
            () => {

                this.componentService.deleteLogFrameRowComponents(this.component.componentId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The log frame row components have been deleted", "Delete Log Frame Row Components");
                            this.searchLogFrameRowComponents();
                        },
                        error: err => {
                            this.errorService.handleError(err, "Log Frame Row Components", "Delete");
                        }
                    });
            }, () => { });

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
        this.router.navigate(["/theoriesofchange", theoryOfChangeComponent.theoryOfChange.theoryOfChangeId, "theoryofchangecomponents", theoryOfChangeComponent.componentId]);
    }

    addTheoryOfChangeComponents(): void {
        this.theoryOfChangeModal.open();
    }

    changeTheoryOfChange(theoriesOfChange: TheoryOfChange[]): void {
        if (!theoriesOfChange.length) return;
        const theoryOfChangeIdList = theoriesOfChange.map(o => o.theoryOfChangeId);
        this.componentService.saveTheoryOfChangeComponents(this.component.componentId, theoryOfChangeIdList)
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
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Theory of Change Component", text: "Are you sure you want to delete this theory of change component?", deleteStyle: true, ok: "Delete" } as ModalOptions;
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
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Theory of Change Components", text: "Are you sure you want to delete all the components?", deleteStyle: true, ok: "Delete" } as ModalOptions;
        modalRef.result.then(
            () => {

                this.componentService.deleteTheoryOfChangeComponents(this.component.componentId)
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

    searchComponentIndicators(pageIndex = 0): Subject<ComponentIndicatorSearchResponse> {

        this.componentIndicatorsSearchOptions.pageIndex = pageIndex;

        const subject = new Subject<ComponentIndicatorSearchResponse>()

        this.componentIndicatorService.search(this.componentIndicatorsSearchOptions)
            .subscribe({
                next: response => {
                    subject.next(response);
                    this.componentIndicators = response.componentIndicators;
                    this.componentIndicatorsHeaders = response.headers;
                },
                error: err => {
                    this.errorService.handleError(err, "Component Indicators", "Load");
                }
            });

        return subject;

    }

    goToComponentIndicator(componentIndicator: ComponentIndicator): void {
        this.router.navigate(["componentindicators", componentIndicator.indicatorId], { relativeTo: this.route });
    }

    addComponentIndicators(): void {
        this.indicatorModal.open();
    }

    changeIndicator(indicators: Indicator[]): void {
        if (!indicators.length) return;
        const indicatorIdList = indicators.map(o => o.indicatorId);
        this.componentService.saveComponentIndicators(this.component.componentId, indicatorIdList)
            .subscribe({
                next: () => {
                    this.toastr.success("The component indicators have been saved", "Save Component Indicators");
                    this.searchComponentIndicators(this.componentIndicatorsHeaders.pageIndex);
                },
                error: err => {
                    this.errorService.handleError(err, "Component Indicators", "Save");
                }
            });
    }

    deleteComponentIndicator(componentIndicator: ComponentIndicator, event: MouseEvent): void {
        event.stopPropagation();

        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Component Indicator", text: "Are you sure you want to delete this component indicator?", deleteStyle: true, ok: "Delete" } as ModalOptions;
        modalRef.result.then(
            () => {

                this.componentIndicatorService.delete(componentIndicator.componentId, componentIndicator.indicatorId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The component indicator has been deleted", "Delete Component Indicator");
                            this.searchComponentIndicators(this.componentIndicatorsHeaders.pageIndex);
                        },
                        error: err => {
                            this.errorService.handleError(err, "Component Indicator", "Delete");
                        }
                    });

            }, () => { });
    }

    deleteComponentIndicators(): void {
        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Component Indicators", text: "Are you sure you want to delete all the component indicators?", deleteStyle: true, ok: "Delete" } as ModalOptions;
        modalRef.result.then(
            () => {

                this.componentService.deleteComponentIndicators(this.component.componentId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The component indicators have been deleted", "Delete Component Indicators");
                            this.searchComponentIndicators();
                        },
                        error: err => {
                            this.errorService.handleError(err, "Component Indicators", "Delete");
                        }
                    });
            }, () => { });

    }

}
