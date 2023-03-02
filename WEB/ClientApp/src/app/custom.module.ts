import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { SharedModule } from './shared.module';
import { StrongPasswordModule } from './common/zxcvbn/strong-password.module';
import { HomeComponent } from './home/home.component';
import { AccountComponent } from './account/account.component';
import { ErrorsComponent } from './error/errors.component';
import { ErrorComponent } from './error/error.component';
import { SettingsComponent } from './settings/settings.component';
import { SetupComponent } from './setup/setup.component';
import { CustomRoutes } from './custom.routes';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        RouterModule.forChild(CustomRoutes),
        NgbModule,
        DragDropModule,
        SharedModule,
        StrongPasswordModule
    ],
    declarations: [
        HomeComponent,
        AccountComponent,
        ErrorsComponent,
        ErrorComponent,
        SettingsComponent,
        SetupComponent
    ]
})
export class CustomModule { }
