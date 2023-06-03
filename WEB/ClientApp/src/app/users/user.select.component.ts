import { Component, OnInit, forwardRef, ViewChild, Input, EventEmitter, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { UserModalComponent } from './user.modal.component';
import { User } from '../common/models/user.model';
import { Enum } from '../common/models/enums.model';

@Component({
    selector: 'user-select',
    templateUrl: './user.select.component.html',
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => UserSelectComponent),
        multi: true
    }],
    host: { 'class': 'app-select' }
})
export class UserSelectComponent implements OnInit, ControlValueAccessor {

    @Input() user: User;
    @Input() users: User[] = [];
    @Output() userChange = new EventEmitter<User>();
    @Output() usersChange = new EventEmitter<User[]>();
    @Input() canRemoveFilters = false;
    @Input() multiple = false;
    @Input() showAddNew = false;
    @Input() role: Enum;

    disabled = false;
    placeholder = this.multiple ? "Select users" : "Select a user";

    @ViewChild('modal') modal: UserModalComponent;

    constructor(
    ) {
    }

    ngOnInit(): void {
    }

    propagateChange = (_: any) => { };

    writeValue(id: string | string[]): void {
        if (id !== undefined) {
            this.propagateChange(id);
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

    changed(user: User | User[]) {
        if (this.disabled) return;
        if (this.multiple) {
            this.writeValue(user ? (user as User[]).map(o => o.id) : null);
            this.users = (user as User[]);
            this.usersChange.emit((user as User[]));
        } else {
            this.writeValue(user ? (user as User).id : null);
            this.user = (user as User);
            this.userChange.emit((user as User));
        }
    }

    getLabel() {
        return this.multiple ? this.users.map(user => user.fullName).join(", ") : this.user?.fullName ?? "";
    }

    click(button = false) {
        if (this.disabled) return;
        // clear the selector if there is something there already
        if (button && (this.user || this.users.length)) this.changed(this.multiple ? [] : null);
        else this.modal.open();
    }
}
