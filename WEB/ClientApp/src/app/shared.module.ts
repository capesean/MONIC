import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MainComponent } from './main.component';
import { BreadcrumbComponent } from './common/components/breadcrumb.component';
import { ColorComponent } from './common/components/color.component';
import { ConfirmModalComponent } from './common/components/confirm.component';
import { FileComponent } from './common/components/file.component';
import { HeaderComponent } from './common/components/header.component';
import { NavMenuComponent } from './common/components/nav-menu.component';
import { PagerComponent } from './common/components/pager.component';
import { PageTitleComponent } from './common/components/pagetitle.component';
import { SortIconComponent } from './common/components/sorticon.component';
import { AppHasRoleDirective } from './common/directives/apphasrole';
import { AppFileInputDirective } from './common/directives/appfileinput';
import { SpyOnDirective } from './common/scroll-spy/spy-on.directive';
import { BooleanPipe } from './common/pipes/booleanpipe';
import { MomentPipe } from './common/pipes/momentpipe';
import { UserSelectComponent } from './users/user.select.component';
import { UserModalComponent } from './users/user.modal.component';
import { UserTestSelectComponent } from './usertests/usertest.select.component';
import { UserTestModalComponent } from './usertests/usertest.modal.component';
import { UserTestSortComponent } from './usertests/usertest.sort.component';

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        FormsModule,
        NgbModule,
        DragDropModule
    ],
    declarations: [
        MainComponent,
        NavMenuComponent,
        HeaderComponent,
        ConfirmModalComponent,
        PagerComponent,
        SortIconComponent,
        FileComponent,
        ColorComponent,
        BreadcrumbComponent,
        PageTitleComponent,
        MomentPipe,
        BooleanPipe,
        AppFileInputDirective,
        AppHasRoleDirective,
        SpyOnDirective,
        UserSelectComponent,
        UserModalComponent,
        UserTestSelectComponent,
        UserTestModalComponent,
        UserTestSortComponent
    ],
    exports: [
        MainComponent,
        NavMenuComponent,
        HeaderComponent,
        ConfirmModalComponent,
        PagerComponent,
        SortIconComponent,
        FileComponent,
        ColorComponent,
        BreadcrumbComponent,
        PageTitleComponent,
        MomentPipe,
        BooleanPipe,
        AppFileInputDirective,
        AppHasRoleDirective,
        SpyOnDirective,
        UserSelectComponent,
        UserModalComponent,
        UserTestSelectComponent,
        UserTestModalComponent,
        UserTestSortComponent
    ]
})
export class SharedModule { }
