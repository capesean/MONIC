import { Route } from '@angular/router';
import { AccessGuard } from './common/auth/auth.accessguard';
import { UserListComponent } from './users/user.list.component';
import { UserEditComponent } from './users/user.edit.component';
import { UserTestListComponent } from './usertests/usertest.list.component';
import { UserTestEditComponent } from './usertests/usertest.edit.component';

export const GeneratedRoutes: Route[] = [
    {
        path: 'users',
        canActivate: [AccessGuard],
        canActivateChild: [AccessGuard],
        component: UserListComponent,
        data: {
            menu: 'admin',
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
                    breadcrumb: 'Add User'
                },
                children: [
                    {
                        path: 'usertests/:userTestId',
                        component: UserTestEditComponent,
                        canActivate: [AccessGuard],
                        canActivateChild: [AccessGuard],
                        data: {
                            menu: 'admin',
                            breadcrumb: 'Add User Test'
                        }
                    }
                ]
            }
        ]
    },
    {
        path: 'usertests',
        canActivate: [AccessGuard],
        canActivateChild: [AccessGuard],
        component: UserTestListComponent,
        data: {
            breadcrumb: 'User Tests'
        }
    }
];
