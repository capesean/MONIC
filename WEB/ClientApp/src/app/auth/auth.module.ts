import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthComponent } from './auth.component';
import { AuthRoutes } from './auth.routes';
import { LoginComponent } from './login/login.component';
import { ResetPasswordComponent } from './reset/resetpassword.component';
import { ResetComponent } from './reset/reset.component';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(AuthRoutes),
        FormsModule],
    declarations: [AuthComponent, LoginComponent, ResetPasswordComponent, ResetComponent]
})
export class AuthModule { }
