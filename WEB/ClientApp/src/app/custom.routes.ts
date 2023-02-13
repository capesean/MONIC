import { Route } from '@angular/router';
import { AccessGuard } from './common/auth/auth.accessguard';
import { HomeComponent } from './home/home.component';
import { ErrorComponent } from './error/error.component';
import { ErrorsComponent } from './error/errors.component';
import { SettingsComponent } from './settings/settings.component';
import { SetupComponent } from './setup/setup.component';
import { AccountComponent } from './account/account.component';

export const CustomRoutes: Route[] = [
    {
        path: '',
        canActivate: [AccessGuard],
        canActivateChild: [AccessGuard],
        component: HomeComponent,
        pathMatch: 'full',
        data: {
            breadcrumb: 'Home'
        },
    },
    {
        path: 'account',
        canActivate: [AccessGuard],
        canActivateChild: [AccessGuard],
        component: AccountComponent,
        pathMatch: 'full',
        data: {
            breadcrumb: 'Account'
        },
    },
    {
        path: 'setup',
        component: SetupComponent,
        pathMatch: 'full'
    },
    {
        path: 'settings',
        canActivate: [AccessGuard],
        canActivateChild: [AccessGuard],
        component: SettingsComponent,
        pathMatch: 'full',
        data: {
            breadcrumb: 'Settings',
            menu: 'admin'
        },
    },
    {
        path: 'errors',
        canActivate: [AccessGuard],
        canActivateChild: [AccessGuard],
        component: ErrorsComponent,
        data: { breadcrumb: 'Errors' },
        children: [
            {
                path: ':id',
                component: ErrorComponent,
                canActivate: [AccessGuard],
                canActivateChild: [AccessGuard],
                data: {
                    breadcrumb: 'Error'
                }
            }
        ]
    }
];
