import { Route } from '@angular/router';
import { AuthComponent } from './auth.component';
import { LoginComponent } from './login/login.component';
import { ResetPasswordComponent } from './reset/resetpassword.component';
import { ResetComponent } from './reset/reset.component';

export const AuthRoutes: Route[] = [
   {
      path: '',
      component: AuthComponent,
      children: [
         {
            path: 'login',
            component: LoginComponent
         },
         {
            path: 'resetpassword',
            component: ResetPasswordComponent
         },
          {
              path: 'reset',
              component: ResetComponent
          },
         {
            path: '**',
            redirectTo: 'login'
         }
      ]
   }
];

