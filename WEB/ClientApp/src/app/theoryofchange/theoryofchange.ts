import { Component as NgComponent, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ErrorService } from '../common/services/error.service';
import { Edge, Node } from '@swimlane/ngx-graph';
import { ComponentService } from '../common/services/component.service';
import { Component } from '../common/models/component.model';
import { Subject } from 'rxjs';
import { ComponentTypes } from '../common/models/enums.model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TheoryOfChangeComponentModal } from './theoryofchangecomponent.modal';
import { TheoryOfChange } from '../common/models/theoryofchange.model';
import { TheoryOfChangeService } from '../common/services/theoryofchange.service';
import { BreadcrumbService } from '../common/services/breadcrumb.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ComponentModalComponent } from '../admin/components/component.modal.component';
import { ToastrService } from 'ngx-toastr';
import { RelationshipService } from '../common/services/relationship.service';
import { Relationship } from '../common/models/relationship.model';
import { TheoryOfChangeRelationshipModal } from './theoryofchangerelationship.modal';
import { ConfirmModalComponent, ConfirmModalOptions } from '../common/components/confirm.component';
import { NgForm } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

@NgComponent({
    selector: 'app-theoryofchange',
    templateUrl: './theoryofchange.html',
    styleUrls: ['./theoryofchange.css'],
    standalone: false
})
export class TheoryOfChangeComponent implements OnInit {

    @ViewChild('componentModal') componentModal: ComponentModalComponent;

    public theoryOfChange = new TheoryOfChange();
    public theoryOfChangeId: string; // required for ngModelChange
    public isNew = false;
    public loaded = false;

    public nodes: Node[] = [];
    public links: Edge[] = [];
    public update$: Subject<boolean> = new Subject();
    public selectedComponentId: string;
    private components: Map<string, Component> = new Map<string, Component>();
    private relationships: Relationship[] = [];
    public settings = {
        draggingEnabled: false,
        panningEnabled: true,
        zoomEnabled: false,
        showMiniMap: false,
        panOnZoom: true,
        autoZoom: true,
        autoCenter: true
    }

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private componentService: ComponentService,
        private relationshipService: RelationshipService,
        private errorService: ErrorService,
        private modalService: NgbModal,
        private theoryOfChangeService: TheoryOfChangeService,
        private breadcrumbService: BreadcrumbService,
        private toastr: ToastrService
    ) {
    }

    public ngOnInit(): void {

        this.route.params.subscribe(params => {

            const theoryOfChangeId = params["theoryOfChangeId"];
            this.isNew = theoryOfChangeId === "add";

            if (!this.isNew) {

                this.theoryOfChange.theoryOfChangeId = theoryOfChangeId;
                this.theoryOfChangeId = theoryOfChangeId;
                this.loadTheoryOfChange();

            }

        });

    }

    public save(form: NgForm): void {

        if (form.invalid) {

            this.toastr.error("The form has not been completed correctly.", "Form Error");
            return;

        }

        this.theoryOfChangeService.save(this.theoryOfChange)
            .subscribe({
                next: theoryOfChange => {
                    this.toastr.success("The theory of change has been saved", "Save Theory of Change");
                    if (this.isNew)
                        this.router.navigate(["../", theoryOfChange.theoryOfChangeId], { relativeTo: this.route });
                    this.isNew = false;
                },
                error: err => {
                    this.errorService.handleError(err, "Theory of Change", "Save");
                }
            });
    }

    public delete(): void {
        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Theory of Change", text: "Are you sure you want to delete this theory of change?", deleteStyle: true, ok: "Delete" } as ConfirmModalOptions;
        modalRef.result.then(
            () => {

                this.theoryOfChangeService.delete(this.theoryOfChange.theoryOfChangeId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The theory of change has been deleted", "Delete Theory of Change");
                            this.router.navigate(["/theoryofchange"]);
                        },
                        error: err => {
                            this.errorService.handleError(err, "Theory of Change", "Delete");
                        }
                    });

            }, () => { });
    }

    private loadTheoryOfChange(): void {

        this.loaded = false;
        this.nodes = [];
        this.links = [];

        const n: Node[] = [];
        const l: Edge[] = [];

        this.relationships = [];

        this.theoryOfChangeService.get(this.theoryOfChangeId, true)
            .subscribe({
                next: theoryOfChange => {

                    this.theoryOfChange = theoryOfChange;
                    this.changeBreadcrumb();

                    theoryOfChange.theoryOfChangeComponents.forEach(tocComp => {

                        const comp = tocComp.component;
                        this.components.set(comp.componentId, comp);

                        // prepare for the graph
                        n.push(
                            {
                                id: this.cleanGuid(comp.componentId),
                                label: comp.name,
                                data: {
                                    id: comp.componentId,
                                    // todo: rename comp.colour to comp.backgroundColour
                                    // todo: add comp.textColour
                                    // todo: comp is not saving empty as NULL
                                    bgColor: !!comp.backgroundColour ? comp.backgroundColour : this.getBgColor(comp.componentType),
                                    textColor: !!comp.textColour ? comp.textColour : "white"
                                }
                            } as Node
                        );

                    });

                    theoryOfChange.relationships.forEach(rel => {

                        this.relationships.push(rel);

                        // todo: only create the relationship if both source & target components are in the model
                        if (this.components.has(rel.sourceComponentId) && this.components.has(rel.targetComponentId)) {
                            l.push(
                                {
                                    id: this.cleanGuid(rel.relationshipId),
                                    source: this.cleanGuid(rel.sourceComponentId),
                                    target: this.cleanGuid(rel.targetComponentId),
                                    label: rel.label,
                                    data: {
                                        id: rel.relationshipId
                                    }
                                } as Edge
                            );
                        }

                    });

                    this.nodes = n;
                    this.links = l;
                    this.loaded = true;
                },
                error: err => {
                    this.errorService.handleError(err, "Theory of Change", "Load");
                    if (err instanceof HttpErrorResponse && err.status === 404)
                        this.router.navigate(["../"], { relativeTo: this.route });
                }
            });

    }

    // todo: make this/these utility functions?
    private cleanGuid(guid: string): string {
        return "id" + guid.replace(/\-/g, "");
    }

    private getBgColor(type: ComponentTypes): string {
        //these should come from settings?
        if (type === ComponentTypes.Input) return "#93cd81";
        if (type === ComponentTypes.Activity) return "#5fc5b0";
        if (type === ComponentTypes.Output) return "#179caf";
        if (type === ComponentTypes.Outcome) return "#107885";
        if (type === ComponentTypes.Impact) return "#1f5571";
        return "white";
    }

    public graphClick($event: MouseEvent): void {
        this.selectedComponentId = undefined;
    }

    public nodeClick($event: MouseEvent, node: Node): void {
        $event.stopPropagation();
        // user is pressing ctrl key: creating a link/relationship
        if ($event.ctrlKey) {

            if (this.selectedComponentId) {

                // a (source) component has previously been selected, fetch the two selected components
                const sourceComponent = this.components.get(this.selectedComponentId);
                const targetComponent = this.components.get(node.data.id);

                // check if an existing relationship/link exists:
                const relationship = this.relationships.find(o => o.sourceComponentId === sourceComponent.componentId && o.targetComponentId === targetComponent.componentId);

                if (relationship) {

                    // a relationship already exists - ask user to edit that one
                    let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
                    (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Link Components", text: `There is already a link between <strong>${sourceComponent.name}</strong> and <strong>${targetComponent.name}</strong>. Would you like to edit the existing link, or create a new one?`, ok: "Edit", no: "Create", cancel: "" } as ConfirmModalOptions;
                    modalRef.result.then(
                        (result: boolean) => {
                            if (result) {
                                // edit existing relationship. load first to get field values, etc.
                                this.relationshipService.get(relationship.relationshipId)
                                    .subscribe(lr => this.openRelationshipModal(lr));
                            } else {
                                // user wants to create a new one
                                this.openRelationshipModal(undefined, sourceComponent, targetComponent);
                            }
                        },
                        () => { }
                    );

                } else {

                    // no relationship already exists - create a new one
                    this.openRelationshipModal(undefined, sourceComponent, targetComponent);

                }

                // clear the selected component id
                this.selectedComponentId = undefined;

            } else {
                // a (source) component is being selected (none previously selected)
                this.selectedComponentId = node.data.id;
            }
        }
        else {
            // load the component with fields, documents, etc.
            this.componentService.get(node.data.id)
                .subscribe(component => this.openComponentModal(component));
        }
    }

    public linkClick(link: Edge): void {
        // load the relationship with fields, documents, etc.
        this.relationshipService.get(link.data.id)
            .subscribe(relationship => this.openRelationshipModal(relationship));
    }

    private openComponentModal(component?: Component): void {
        let modalRef = this.modalService.open(TheoryOfChangeComponentModal, { size: 'xl', centered: true, scrollable: false });
        (modalRef.componentInstance as TheoryOfChangeComponentModal).setComponent(this.theoryOfChange, component);
        modalRef.result.then(
            () => {
                this.loadTheoryOfChange();
                // todo: handle errors on save?
            }, () => { });
    }

    private openRelationshipModal(relationship: Relationship, sourceComponent?: Component, targetComponent?: Component): void {
        let modalRef = this.modalService.open(TheoryOfChangeRelationshipModal, { size: 'xl', centered: true, scrollable: false });
        (modalRef.componentInstance as TheoryOfChangeRelationshipModal).setRelationship(this.theoryOfChange, relationship, sourceComponent, targetComponent);
        modalRef.result.then(
            () => {
                this.loadTheoryOfChange();
                // todo: handle errors on save?
            }, () => { });
    }

    public addComponent(): void {
        this.openComponentModal();
    }

    public selectComponents(): void {
        this.componentModal.open();
    }

    public changeComponent(components: Component[]): void {
        if (!components.length) return;
        const componentIdList = components.map(o => o.componentId);
        this.theoryOfChangeService.saveTheoryOfChangeComponents(this.theoryOfChange.theoryOfChangeId, componentIdList)
            .subscribe({
                next: () => {
                    this.toastr.success("The theory of change components have been saved", "Save Theory of Change Components");
                    this.loadTheoryOfChange();
                },
                error: err => {
                    this.errorService.handleError(err, "Theory of Change Components", "Save");
                }
            });
    }

    public changeBreadcrumb(): void {
        this.breadcrumbService.changeBreadcrumb(this.route.snapshot, this.theoryOfChange.name !== undefined ? this.theoryOfChange.name.substring(0, 25) : "(new theory of change)");
    }

    openSettings(content: TemplateRef<any>) {
        this.modalService.open(content);
    }
}
