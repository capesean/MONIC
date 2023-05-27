import { Component as NgComponent, OnInit, forwardRef, ViewChild, Input, EventEmitter, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ProjectModalComponent } from './project.modal.component';
import { Project } from '../../common/models/project.model';
import { Enum } from '../../common/models/enums.model';

@NgComponent({
    selector: 'project-select',
    templateUrl: './project.select.component.html',
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => ProjectSelectComponent),
        multi: true
    }],
    host: { 'class': 'app-select' }
})
export class ProjectSelectComponent implements OnInit, ControlValueAccessor {

    @Input() project: Project;
    @Input() projects: Project[] = [];
    @Output() projectChange = new EventEmitter<Project>();
    @Output() projectsChange = new EventEmitter<Project[]>();
    @Input() canRemoveFilters = false;
    @Input() multiple = false;
    @Input() showAddNew = false;

    disabled = false;
    placeholder = this.multiple ? "Select projects" : "Select a project";

    @ViewChild('modal') modal: ProjectModalComponent;

    constructor(
    ) {
    }

    ngOnInit(): void {
    }

    propagateChange = (_: any) => { };

    writeValue(projectId: string | string[]): void {
        if (projectId !== undefined) {
            this.propagateChange(projectId);
        }
    }

    registerOnChange(fn: any): void {
        this.propagateChange = fn;
    }

    registerOnTouched(): void {
    }

    setDisabledState?(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }

    changed(project: Project | Project[]) {
        if (this.disabled) return;
        if (this.multiple) {
            this.writeValue(project ? (project as Project[]).map(o => o.projectId) : null);
            this.projects = (project as Project[]);
            this.projectsChange.emit((project as Project[]));
        } else {
            this.writeValue(project ? (project as Project).projectId : null);
            this.project = (project as Project);
            this.projectChange.emit((project as Project));
        }
    }

    getLabel() {
        return this.multiple ? this.projects.map(project => project.name).join(", ") : this.project?.name ?? "";
    }

    click(button = false) {
        if (this.disabled) return;
        // clear the selector if there is something there already
        if (button && (this.project || this.projects.length)) this.changed(this.multiple ? [] : null);
        else this.modal.open();
    }
}
