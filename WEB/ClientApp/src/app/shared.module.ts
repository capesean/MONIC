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
import { PromptModalComponent } from './common/components/prompt.component';
import { FileComponent } from './common/components/file.component';
import { HeaderComponent } from './common/components/header.component';
import { NavMenuComponent } from './common/components/nav-menu.component';
import { PagerComponent } from './common/components/pager.component';
import { PageTitleComponent } from './common/components/pagetitle.component';
import { SortIconComponent } from './common/components/sorticon.component';
import { AppHasRoleDirective } from './common/directives/apphasrole';
import { AppFileInputDirective } from './common/directives/appfileinput';
import { BooleanPipe } from './common/pipes/booleanpipe';
import { MomentPipe } from './common/pipes/momentpipe';
import { FileSizePipe } from './common/pipes/filesizepipe';
import { UserSelectComponent } from './users/user.select.component';
import { UserModalComponent } from './users/user.modal.component';

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
        PromptModalComponent,
        PagerComponent,
        SortIconComponent,
        FileComponent,
        ColorComponent,
        BreadcrumbComponent,
        PageTitleComponent,
        MomentPipe,
        BooleanPipe,
        FileSizePipe,
        AppFileInputDirective,
        AppHasRoleDirective,
        UserSelectComponent,
        UserModalComponent
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
        FileSizePipe,
        AppFileInputDirective,
        AppHasRoleDirective,
        UserSelectComponent,
        UserModalComponent
    ]
})
export class SharedModule { }
