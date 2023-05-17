import { Route, } from '@angular/router';
import { NotFoundComponent } from './common/components/notfound.component';
import { MainComponent } from './main.component';
import { SetupComponent } from './setup/setup.component';

export const AppRoutes: Route[] = [
    {
        path: 'auth',
        loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)
    },
    {
        path: 'setup',
        component: SetupComponent,
        pathMatch: 'full'
    },
    {
        path: 'public',
        loadChildren: () => import('./public/public.module').then(m => m.PublicModule)
    },
    {
        path: '',
        component: MainComponent,
        data: {},
        children: [
            {
                path: '',
                loadChildren: () => import('./custom.module').then(m => m.CustomModule)
            },
            {
                path: '',
                loadChildren: () => import('./generated.module').then(m => m.GeneratedModule)
            },
            { path: '404', component: NotFoundComponent },
            { path: '**', redirectTo: '/404' }
        ]
    }
];
