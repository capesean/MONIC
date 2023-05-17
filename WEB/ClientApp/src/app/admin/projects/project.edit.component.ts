import { Component as NgComponent, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmModalComponent, ModalOptions } from '../../common/components/confirm.component';
import { PagingHeaders } from '../../common/models/http.model';
import { Project } from '../../common/models/project.model';
import { BreadcrumbService } from '../../common/services/breadcrumb.service';
import { ErrorService } from '../../common/services/error.service';
import { ProjectService } from '../../common/services/project.service';
import { Milestone, MilestoneSearchOptions, MilestoneSearchResponse } from '../../common/models/milestone.model';
import { MilestoneService } from '../../common/services/milestone.service';
import { MilestoneSortComponent } from '../milestones/milestone.sort.component';

@NgComponent({
    selector: 'project-edit',
    templateUrl: './project.edit.component.html'
})
export class ProjectEditComponent implements OnInit, OnDestroy {

    public project: Project = new Project();
    public isNew = true;
    private routerSubscription: Subscription;

    public milestonesSearchOptions = new MilestoneSearchOptions();
    public milestonesHeaders = new PagingHeaders();
    public milestones: Milestone[] = [];
    public showMilestonesSearch = false;

    constructor(
        private router: Router,
        public route: ActivatedRoute,
        private toastr: ToastrService,
        private breadcrumbService: BreadcrumbService,
        private modalService: NgbModal,
        private projectService: ProjectService,
        private milestoneService: MilestoneService,
        private errorService: ErrorService
    ) {
    }

    ngOnInit(): void {

        this.route.params.subscribe(params => {

            const projectId = params["projectId"];
            this.isNew = projectId === "add";

            if (!this.isNew) {

                this.project.projectId = projectId;
                this.loadProject();

                this.milestonesSearchOptions.projectId = projectId;
                this.milestonesSearchOptions.includeParents = true;
                this.searchMilestones();

            }

            this.routerSubscription = this.router.events.subscribe(event => {
                if (event instanceof NavigationEnd && !this.route.firstChild) {
                    // this will double-load on new save, as params change (above) + nav ends
                    this.searchMilestones();
                }
            });

        });

    }

    ngOnDestroy(): void {
        this.routerSubscription.unsubscribe();
    }

    private loadProject(): void {

        this.projectService.get(this.project.projectId)
            .subscribe({
                next: project => {
                    this.project = project;
                    this.changeBreadcrumb();
                },
                error: err => {
                    this.errorService.handleError(err, "Project", "Load");
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

        this.projectService.save(this.project)
            .subscribe({
                next: project => {
                    this.toastr.success("The project has been saved", "Save Project");
                    if (this.isNew) {
                        this.ngOnDestroy();
                        this.router.navigate(["../", project.projectId], { relativeTo: this.route });
                    }
                },
                error: err => {
                    this.errorService.handleError(err, "Project", "Save");
                }
            });

    }

    delete(): void {

        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Project", text: "Are you sure you want to delete this project?", deleteStyle: true, ok: "Delete" } as ModalOptions;
        modalRef.result.then(
            () => {

                this.projectService.delete(this.project.projectId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The project has been deleted", "Delete Project");
                            this.router.navigate(["../"], { relativeTo: this.route });
                        },
                        error: err => {
                            this.errorService.handleError(err, "Project", "Delete");
                        }
                    });

            }, () => { });
    }

    changeBreadcrumb(): void {
        this.breadcrumbService.changeBreadcrumb(this.route.snapshot, this.project.name !== undefined ? this.project.name.substring(0, 25) : "(new project)");
    }

    searchMilestones(pageIndex = 0): Subject<MilestoneSearchResponse> {

        this.milestonesSearchOptions.pageIndex = pageIndex;

        const subject = new Subject<MilestoneSearchResponse>()

        this.milestoneService.search(this.milestonesSearchOptions)
            .subscribe({
                next: response => {
                    subject.next(response);
                    this.milestones = response.milestones;
                    this.milestonesHeaders = response.headers;
                },
                error: err => {
                    this.errorService.handleError(err, "Milestones", "Load");
                }
            });

        return subject;

    }

    goToMilestone(milestone: Milestone): void {
        this.router.navigate(["milestones", milestone.milestoneId], { relativeTo: this.route });
    }

    deleteMilestone(milestone: Milestone, event: MouseEvent): void {
        event.stopPropagation();

        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Milestone", text: "Are you sure you want to delete this milestone?", deleteStyle: true, ok: "Delete" } as ModalOptions;
        modalRef.result.then(
            () => {

                this.milestoneService.delete(milestone.milestoneId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The milestone has been deleted", "Delete Milestone");
                            this.searchMilestones(this.milestonesHeaders.pageIndex);
                        },
                        error: err => {
                            this.errorService.handleError(err, "Milestone", "Delete");
                        }
                    });

            }, () => { });
    }

    deleteMilestones(): void {
        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Milestones", text: "Are you sure you want to delete all the milestones?", deleteStyle: true, ok: "Delete" } as ModalOptions;
        modalRef.result.then(
            () => {

                this.projectService.deleteMilestones(this.project.projectId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The milestones have been deleted", "Delete Milestones");
                            this.searchMilestones();
                        },
                        error: err => {
                            this.errorService.handleError(err, "Milestones", "Delete");
                        }
                    });
            }, () => { });

    }

    showMilestoneSort(): void {
        let modalRef = this.modalService.open(MilestoneSortComponent, { size: 'xl', centered: true, scrollable: false });
        (modalRef.componentInstance as MilestoneSortComponent).projectId = this.project.projectId;
        modalRef.result.then(
            () => this.searchMilestones(this.milestonesHeaders.pageIndex),
            () => { }
        );
    }

}
