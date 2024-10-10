import { Component as NgComponent, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';
import { Subject } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmModalComponent, ConfirmModalOptions } from '../../common/components/confirm.component';
import { PagingHeaders } from '../../common/models/http.model';
import { Group } from '../../common/models/group.model';
import { Enum, Enums } from '../../common/models/enums.model';
import { BreadcrumbService } from '../../common/services/breadcrumb.service';
import { ErrorService } from '../../common/services/error.service';
import { GroupService } from '../../common/services/group.service';
import { Field, FieldSearchOptions, FieldSearchResponse } from '../../common/models/field.model';
import { FieldService } from '../../common/services/field.service';

@NgComponent({
    selector: 'group-edit',
    templateUrl: './group.edit.component.html'
})
export class GroupEditComponent implements OnInit {

    public group: Group = new Group();
    public isNew = true;
    public sizes: Enum[] = Enums.Sizes;
    public fieldTypes: Enum[] = Enums.FieldTypes;

    public fieldsSearchOptions = new FieldSearchOptions();
    public fieldsHeaders = new PagingHeaders();
    public fields: Field[] = [];
    public showFieldsSearch = false;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private toastr: ToastrService,
        private breadcrumbService: BreadcrumbService,
        private modalService: NgbModal,
        private groupService: GroupService,
        private fieldService: FieldService,
        private errorService: ErrorService
    ) {
    }

    ngOnInit(): void {

        this.route.params.subscribe(params => {

            const groupId = params["groupId"];
            this.isNew = groupId === "add";

            if (!this.isNew) {

                this.group.groupId = groupId;
                this.loadGroup();

                this.fieldsSearchOptions.groupId = groupId;
                this.fieldsSearchOptions.includeParents = true;
                this.searchFields();

            }

        });

    }

    private loadGroup(): void {

        this.groupService.get(this.group.groupId)
            .subscribe({
                next: group => {
                    this.group = group;
                    this.changeBreadcrumb();
                },
                error: err => {
                    this.errorService.handleError(err, "Group", "Load");
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

        this.groupService.save(this.group)
            .subscribe({
                next: group => {
                    this.toastr.success("The group has been saved", "Save Group");
                    if (this.isNew) this.router.navigate(["../", group.groupId], { relativeTo: this.route });
                },
                error: err => {
                    this.errorService.handleError(err, "Group", "Save");
                }
            });

    }

    delete(): void {

        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Group", text: "Are you sure you want to delete this group?", deleteStyle: true, ok: "Delete" } as ConfirmModalOptions;
        modalRef.result.then(
            () => {

                this.groupService.delete(this.group.groupId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The group has been deleted", "Delete Group");
                            this.router.navigate(["../"], { relativeTo: this.route });
                        },
                        error: err => {
                            this.errorService.handleError(err, "Group", "Delete");
                        }
                    });

            }, () => { });
    }

    changeBreadcrumb(): void {
        this.breadcrumbService.changeBreadcrumb(this.route.snapshot, this.group.name !== undefined ? this.group.name.substring(0, 25) : "(new group)");
    }

    searchFields(pageIndex = 0): Subject<FieldSearchResponse> {

        this.fieldsSearchOptions.pageIndex = pageIndex;

        const subject = new Subject<FieldSearchResponse>()

        this.fieldService.search(this.fieldsSearchOptions)
            .subscribe({
                next: response => {
                    subject.next(response);
                    this.fields = response.fields;
                    this.fieldsHeaders = response.headers;
                },
                error: err => {
                    this.errorService.handleError(err, "Fields", "Load");
                }
            });

        return subject;

    }

    goToField(field: Field): void {
        this.router.navigate(["/fields", field.fieldId]);
    }

    deleteField(field: Field, event: MouseEvent): void {
        event.stopPropagation();

        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Field", text: "Are you sure you want to delete this field?", deleteStyle: true, ok: "Delete" } as ConfirmModalOptions;
        modalRef.result.then(
            () => {

                this.fieldService.delete(field.fieldId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The field has been deleted", "Delete Field");
                            this.searchFields(this.fieldsHeaders.pageIndex);
                        },
                        error: err => {
                            this.errorService.handleError(err, "Field", "Delete");
                        }
                    });

            }, () => { });
    }

    deleteFields(): void {
        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Fields", text: "Are you sure you want to delete all the fields?", deleteStyle: true, ok: "Delete" } as ConfirmModalOptions;
        modalRef.result.then(
            () => {

                this.groupService.deleteFields(this.group.groupId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The fields have been deleted", "Delete Fields");
                            this.searchFields();
                        },
                        error: err => {
                            this.errorService.handleError(err, "Fields", "Delete");
                        }
                    });
            }, () => { });

    }

}
