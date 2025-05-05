import { Component as NgComponent, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';
import { Subject } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmModalComponent, ConfirmModalOptions } from '../../common/components/confirm.component';
import { PagingHeaders } from '../../common/models/http.model';
import { EntityType } from '../../common/models/entitytype.model';
import { Enum, Enums } from '../../common/models/enums.model';
import { FadeThenShrink } from '../../common/animations/fadethenshrink';
import { BreadcrumbService } from '../../common/services/breadcrumb.service';
import { ErrorService } from '../../common/services/error.service';
import { EntityTypeService } from '../../common/services/entitytype.service';
import { Entity, EntitySearchOptions, EntitySearchResponse } from '../../common/models/entity.model';
import { EntityService } from '../../common/services/entity.service';
import { Questionnaire, QuestionnaireSearchOptions, QuestionnaireSearchResponse } from '../../common/models/questionnaire.model';
import { QuestionnaireService } from '../../common/services/questionnaire.service';

@NgComponent({
    selector: 'entitytype-edit',
    templateUrl: './entitytype.edit.component.html',
    animations: [FadeThenShrink],
    standalone: false
})
export class EntityTypeEditComponent implements OnInit {

    public entityType: EntityType = new EntityType();
    public isNew = true;
    public dateTypes: Enum[] = Enums.DateTypes;

    public entitiesSearchOptions = new EntitySearchOptions();
    public entitiesHeaders = new PagingHeaders();
    public entities: Entity[] = [];
    public showEntitiesSearch = false;

    public questionnairesSearchOptions = new QuestionnaireSearchOptions();
    public questionnairesHeaders = new PagingHeaders();
    public questionnaires: Questionnaire[] = [];
    public showQuestionnairesSearch = false;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private toastr: ToastrService,
        private breadcrumbService: BreadcrumbService,
        private modalService: NgbModal,
        private entityTypeService: EntityTypeService,
        private entityService: EntityService,
        private questionnaireService: QuestionnaireService,
        private errorService: ErrorService
    ) {
    }

    ngOnInit(): void {

        this.route.params.subscribe(params => {

            const entityTypeId = params["entityTypeId"];
            this.isNew = entityTypeId === "add";

            if (!this.isNew) {

                this.entityType.entityTypeId = entityTypeId;
                this.loadEntityType();

                this.entitiesSearchOptions.entityTypeId = entityTypeId;
                this.entitiesSearchOptions.includeParents = true;
                this.searchEntities();

                this.questionnairesSearchOptions.entityTypeId = entityTypeId;
                this.questionnairesSearchOptions.includeParents = true;
                this.searchQuestionnaires();

            }

        });

    }

    private loadEntityType(): void {

        this.entityTypeService.get(this.entityType.entityTypeId)
            .subscribe({
                next: entityType => {
                    this.entityType = entityType;
                    this.changeBreadcrumb();
                },
                error: err => {
                    this.errorService.handleError(err, "Entity Type", "Load");
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

        this.entityTypeService.save(this.entityType)
            .subscribe({
                next: entityType => {
                    this.toastr.success("The entity type has been saved", "Save Entity Type");
                    if (this.isNew) this.router.navigate(["../", entityType.entityTypeId], { relativeTo: this.route });
                },
                error: err => {
                    this.errorService.handleError(err, "Entity Type", "Save");
                }
            });

    }

    delete(): void {

        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Entity Type", text: "Are you sure you want to delete this entity type?", deleteStyle: true, ok: "Delete" } as ConfirmModalOptions;
        modalRef.result.then(
            () => {

                this.entityTypeService.delete(this.entityType.entityTypeId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The entity type has been deleted", "Delete Entity Type");
                            this.router.navigate(["../"], { relativeTo: this.route });
                        },
                        error: err => {
                            this.errorService.handleError(err, "Entity Type", "Delete");
                        }
                    });

            }, () => { });
    }

    changeBreadcrumb(): void {
        this.breadcrumbService.changeBreadcrumb(this.route.snapshot, this.entityType.name !== undefined ? this.entityType.name.substring(0, 25) : "(new entity type)");
    }

    searchEntities(pageIndex = 0): Subject<EntitySearchResponse> {

        this.entitiesSearchOptions.pageIndex = pageIndex;

        const subject = new Subject<EntitySearchResponse>()

        this.entityService.search(this.entitiesSearchOptions)
            .subscribe({
                next: response => {
                    subject.next(response);
                    this.entities = response.entities;
                    this.entitiesHeaders = response.headers;
                },
                error: err => {
                    this.errorService.handleError(err, "Entities", "Load");
                }
            });

        return subject;

    }

    goToEntity(entity: Entity): void {
        this.router.navigate(["/entities", entity.entityId]);
    }

    deleteEntity(entity: Entity, event: MouseEvent): void {
        event.stopPropagation();

        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Entity", text: "Are you sure you want to delete this entity?", deleteStyle: true, ok: "Delete" } as ConfirmModalOptions;
        modalRef.result.then(
            () => {

                this.entityService.delete(entity.entityId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The entity has been deleted", "Delete Entity");
                            this.searchEntities(this.entitiesHeaders.pageIndex);
                        },
                        error: err => {
                            this.errorService.handleError(err, "Entity", "Delete");
                        }
                    });

            }, () => { });
    }

    deleteEntities(): void {
        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Entities", text: "Are you sure you want to delete all the entities?", deleteStyle: true, ok: "Delete" } as ConfirmModalOptions;
        modalRef.result.then(
            () => {

                this.entityTypeService.deleteEntities(this.entityType.entityTypeId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The entities have been deleted", "Delete Entities");
                            this.searchEntities();
                        },
                        error: err => {
                            this.errorService.handleError(err, "Entities", "Delete");
                        }
                    });
            }, () => { });

    }

    searchQuestionnaires(pageIndex = 0): Subject<QuestionnaireSearchResponse> {

        this.questionnairesSearchOptions.pageIndex = pageIndex;

        const subject = new Subject<QuestionnaireSearchResponse>()

        this.questionnaireService.search(this.questionnairesSearchOptions)
            .subscribe({
                next: response => {
                    subject.next(response);
                    this.questionnaires = response.questionnaires;
                    this.questionnairesHeaders = response.headers;
                },
                error: err => {
                    this.errorService.handleError(err, "Questionnaires", "Load");
                }
            });

        return subject;

    }

    goToQuestionnaire(questionnaire: Questionnaire): void {
        this.router.navigate(["/questionnaires", questionnaire.questionnaireId]);
    }

    deleteQuestionnaire(questionnaire: Questionnaire, event: MouseEvent): void {
        event.stopPropagation();

        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Questionnaire", text: "Are you sure you want to delete this questionnaire?", deleteStyle: true, ok: "Delete" } as ConfirmModalOptions;
        modalRef.result.then(
            () => {

                this.questionnaireService.delete(questionnaire.questionnaireId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The questionnaire has been deleted", "Delete Questionnaire");
                            this.searchQuestionnaires(this.questionnairesHeaders.pageIndex);
                        },
                        error: err => {
                            this.errorService.handleError(err, "Questionnaire", "Delete");
                        }
                    });

            }, () => { });
    }

    deleteQuestionnaires(): void {
        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Questionnaires", text: "Are you sure you want to delete all the questionnaires?", deleteStyle: true, ok: "Delete" } as ConfirmModalOptions;
        modalRef.result.then(
            () => {

                this.entityTypeService.deleteQuestionnaires(this.entityType.entityTypeId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The questionnaires have been deleted", "Delete Questionnaires");
                            this.searchQuestionnaires();
                        },
                        error: err => {
                            this.errorService.handleError(err, "Questionnaires", "Delete");
                        }
                    });
            }, () => { });

    }

}
