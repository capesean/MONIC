import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PagerComponent } from './common/components/pager.component';
import { RouterModule } from '@angular/router';
import { MainComponent } from './main.component';
import { NavMenuComponent } from './common/nav-menu/nav-menu.component';
import { MomentPipe } from './common/pipes/momentPipe';
import { BooleanPipe } from './common/pipes/booleanPipe';
import { ConfirmModalComponent } from './common/components/confirm.component';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { AppFileInputDirective } from './common/directives/appfileinput';
import { FileComponent } from './common/components/file.component';
import { AppHasRoleDirective } from './common/directives/apphasrole';
import { UserSelectComponent } from './users/user.select.component';
import { UserModalComponent } from './users/user.modal.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        NgbModule,
        DragDropModule,
        BreadcrumbModule
    ],
    declarations: [
        PagerComponent,
        MainComponent,
        NavMenuComponent,
        MomentPipe,
        BooleanPipe,
        ConfirmModalComponent,
        AppFileInputDirective,
        FileComponent,
        AppHasRoleDirective,
        UserSelectComponent,
        UserModalComponent
    ],
    exports: [
        PagerComponent,
        MainComponent,
        NavMenuComponent,
        NgbModule,
        MomentPipe,
        BooleanPipe,
        ConfirmModalComponent,
        AppFileInputDirective,
        FileComponent,
        AppHasRoleDirective,
        UserSelectComponent,
        UserModalComponent
    ]
})
export class SharedModule { }
