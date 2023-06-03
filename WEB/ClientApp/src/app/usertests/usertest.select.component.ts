import { Component, OnInit, forwardRef, ViewChild, Input, EventEmitter, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { UserTestModalComponent } from './usertest.modal.component';
import { UserTest } from '../common/models/usertest.model';
import { Enum } from '../common/models/enums.model';
import { User } from '../common/models/user.model';

@Component({
    selector: 'user-test-select',
    templateUrl: './usertest.select.component.html',
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => UserTestSelectComponent),
        multi: true
    }],
    host: { 'class': 'app-select' }
})
export class UserTestSelectComponent implements OnInit, ControlValueAccessor {

    @Input() userTest: UserTest;
    @Input() userTests: UserTest[] = [];
    @Output() userTestChange = new EventEmitter<UserTest>();
    @Output() userTestsChange = new EventEmitter<UserTest[]>();
    @Input() canRemoveFilters = false;
    @Input() multiple = false;
    @Input() showAddNew = false;
    @Input() user: User;

    disabled = false;
    placeholder = this.multiple ? "Select user tests" : "Select an user test";

    @ViewChild('modal') modal: UserTestModalComponent;

    constructor(
    ) {
    }

    ngOnInit(): void {
    }

    propagateChange = (_: any) => { };

    writeValue(userTestId: string | string[]): void {
        if (userTestId !== undefined) {
            this.propagateChange(userTestId);
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

    changed(userTest: UserTest | UserTest[]) {
        if (this.disabled) return;
        if (this.multiple) {
            this.writeValue(userTest ? (userTest as UserTest[]).map(o => o.userTestId) : null);
            this.userTests = (userTest as UserTest[]);
            this.userTestsChange.emit((userTest as UserTest[]));
        } else {
            this.writeValue(userTest ? (userTest as UserTest).userTestId : null);
            this.userTest = (userTest as UserTest);
            this.userTestChange.emit((userTest as UserTest));
        }
    }

    getLabel() {
        return this.multiple ? this.userTests.map(userTest => userTest.name).join(", ") : this.userTest?.name ?? "";
    }

    click(button = false) {
        if (this.disabled) return;
        // clear the selector if there is something there already
        if (button && (this.userTest || this.userTests.length)) this.changed(this.multiple ? [] : null);
        else this.modal.open();
    }
}
