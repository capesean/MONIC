import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PagerComponent } from './common/components/pager.component';
import { RouterModule } from '@angular/router';
import { MainComponent } from './main.component';
import { NavMenuComponent } from './common/nav-menu/nav-menu.component';
import { HeaderComponent } from './common/header/header.component';
import { MomentPipe } from './common/pipes/momentpipe';
import { BooleanPipe } from './common/pipes/booleanpipe';
import { ConfirmModalComponent } from './common/components/confirm.component';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { AppFileInputDirective } from './common/directives/appfileinput';
import { FileComponent } from './common/components/file.component';
import { ColorComponent } from './common/components/color.component';
import { AppHasRoleDirective } from './common/directives/apphasrole';
import { UserSelectComponent } from './users/user.select.component';
import { UserModalComponent } from './users/user.modal.component';
import { UserTestSelectComponent } from './usertests/usertest.select.component';
import { UserTestModalComponent } from './usertests/usertest.modal.component';
import { UserTestSortComponent } from './usertests/usertest.sort.component';

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
        HeaderComponent,
        MomentPipe,
        BooleanPipe,
        ConfirmModalComponent,
        AppFileInputDirective,
        FileComponent,
        ColorComponent,
        AppHasRoleDirective,
        UserSelectComponent,
        UserModalComponent,
        UserTestSelectComponent,
        UserTestModalComponent,
        UserTestSortComponent
    ],
    exports: [
        PagerComponent,
        MainComponent,
        NavMenuComponent,
        HeaderComponent,
        NgbModule,
        MomentPipe,
        BooleanPipe,
        ConfirmModalComponent,
        AppFileInputDirective,
        FileComponent,
        ColorComponent,
        AppHasRoleDirective,
        UserSelectComponent,
        UserModalComponent,
        UserTestSelectComponent,
        UserTestModalComponent,
        UserTestSortComponent
    ]
})
export class SharedModule { }
