import { Component as NgComponent, OnInit, forwardRef, ViewChild, Input, EventEmitter, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { TaskModalComponent } from './task.modal.component';
import { Task } from '../../common/models/task.model';
import { Enum } from '../../common/models/enums.model';
import { Milestone } from '../../common/models/milestone.model';

@NgComponent({
    selector: 'task-select',
    templateUrl: './task.select.component.html',
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => TaskSelectComponent),
        multi: true
    }],
    host: { 'class': 'app-select' },
    standalone: false
})
export class TaskSelectComponent implements OnInit, ControlValueAccessor {

    @Input() task: Task;
    @Input() tasks: Task[] = [];
    @Output() taskChange = new EventEmitter<Task>();
    @Output() tasksChange = new EventEmitter<Task[]>();
    @Input() canRemoveFilters = false;
    @Input() multiple = false;
    @Input() showAddNew = false;
    @Input() milestone: Milestone;

    disabled = false;
    placeholder = this.multiple ? "Select tasks" : "Select a task";

    @ViewChild('modal') modal: TaskModalComponent;

    constructor(
    ) {
    }

    ngOnInit(): void {
    }

    propagateChange = (_: any) => { };

    writeValue(taskId: string | string[]): void {
        if (taskId !== undefined) {
            this.propagateChange(taskId);
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

    changed(task: Task | Task[]) {
        if (this.disabled) return;
        if (this.multiple) {
            this.writeValue(task ? (task as Task[]).map(o => o.taskId) : null);
            this.tasks = (task as Task[]);
            this.tasksChange.emit((task as Task[]));
        } else {
            this.writeValue(task ? (task as Task).taskId : null);
            this.task = (task as Task);
            this.taskChange.emit((task as Task));
        }
    }

    getLabel() {
        return this.multiple ? this.tasks.map(task => task.name).join(", ") : this.task?.name ?? "";
    }

    click(button = false) {
        if (this.disabled) return;
        // clear the selector if there is something there already
        if (button && (this.task || this.tasks.length)) this.changed(this.multiple ? [] : null);
        else this.modal.open();
    }

    clear() {
        this.changed(this.multiple ? [] : null);
    }
}

