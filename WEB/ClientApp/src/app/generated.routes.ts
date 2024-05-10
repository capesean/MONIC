import { Route } from '@angular/router';
import { AccessGuard } from './common/auth/auth.accessguard';
import { SettingsEditComponent } from './settings/settings.edit.component';
import { UserListComponent } from './users/user.list.component';
import { UserEditComponent } from './users/user.edit.component';

export const GeneratedRoutes: Route[] = [
    {
        path: 'settings',
        canActivate: [AccessGuard],
        canActivateChild: [AccessGuard],
        component: SettingsEditComponent,
        data: {
            submenu: 'settings',
            breadcrumb: 'Settings'
        },
    },
    {
        path: 'users',
        canActivate: [AccessGuard],
        canActivateChild: [AccessGuard],
        component: UserListComponent,
        data: {
            menu: 'admin',
            submenu: 'users',
            breadcrumb: 'Users'
        },
        children: [
            {
                path: ':id',
                component: UserEditComponent,
                canActivate: [AccessGuard],
                canActivateChild: [AccessGuard],
                data: {
                    menu: 'admin',
                    submenu: 'users',
                    breadcrumb: 'Add User'
                }
            }
        ]
    }
];
