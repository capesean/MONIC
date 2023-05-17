import { Route } from '@angular/router';
import { AccessGuard } from './common/auth/auth.accessguard';
import { HomeComponent } from './home/home.component';
import { ErrorComponent } from './error/error.component';
import { ErrorsComponent } from './error/errors.component';
import { SetupComponent } from './setup/setup.component';
import { AccountComponent } from './account/account.component';
import { DataEntryComponent } from './forms/dataentry.component';
import { TheoriesOfChangeComponent } from './theoryofchange/theoriesofchange';
import { TheoryOfChangeComponent } from './theoryofchange/theoryofchange';
import { LogFramesComponent } from './logframe/logframes.component';
import { LogFrameComponent } from './logframe/logframe.component';
import { GanttsComponent } from './gantt/gantts.component';
import { GanttComponent } from './gantt/gantt.component';
import { ToolsComponent } from './tools/tools.component';
import { QuestionnairesComponent } from './questionnaire/questionnaires.component';
import { QuestionnaireComponent } from './questionnaire/questionnaire.component';
import { FolderComponent } from './folder/folder.component';

export const CustomRoutes: Route[] = [
    {
        path: '',
        canActivate: [AccessGuard],
        canActivateChild: [AccessGuard],
        component: HomeComponent,
        pathMatch: 'full',
        data: {
            breadcrumb: 'Home',
            menu: 'dashboards'
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
        path: 'dataentry',
        canActivate: [AccessGuard],
        canActivateChild: [AccessGuard],
        component: DataEntryComponent,
        pathMatch: 'full',
        data: {
            breadcrumb: 'Data Entry',
            menu: 'mneTools'
        },
    },
    {
        path: 'theoryofchange',
        canActivate: [AccessGuard],
        canActivateChild: [AccessGuard],
        component: TheoriesOfChangeComponent,
        data: {
            breadcrumb: 'Theories of Change',
            menu: 'mneTools'
        },
        children: [
            {
                path: ':theoryOfChangeId',
                component: TheoryOfChangeComponent,
                canActivate: [AccessGuard],
                canActivateChild: [AccessGuard],
                data: {
                    breadcrumb: 'Add Theory of Change',
                    menu: 'mneTools'
                }
            }
        ]
    },
    {
        path: 'logframe',
        canActivate: [AccessGuard],
        canActivateChild: [AccessGuard],
        component: LogFramesComponent,
        data: {
            breadcrumb: 'Logical Frameworks',
            menu: 'mneTools'
        },
        children: [
            {
                path: ':logFrameId',
                component: LogFrameComponent,
                canActivate: [AccessGuard],
                canActivateChild: [AccessGuard],
                data: {
                    breadcrumb: 'Add Logical Framework',
                    menu: 'mneTools'
                }
            }
        ]
    },
    {
        path: 'questionnaire',
        canActivate: [AccessGuard],
        canActivateChild: [AccessGuard],
        component: QuestionnairesComponent,
        data: {
            breadcrumb: 'Questionnaires',
            menu: 'mneTools'
        },
        children: [
            {
                path: ':responseId',
                component: QuestionnaireComponent,
                canActivate: [AccessGuard],
                canActivateChild: [AccessGuard],
                data: {
                    breadcrumb: 'Add Questionnaire',
                    menu: 'mneTools'
                }
            }
        ]
    },
    {
        path: 'ganttchart',
        canActivate: [AccessGuard],
        canActivateChild: [AccessGuard],
        component: GanttsComponent,
        data: {
            breadcrumb: 'Gantt Charts',
            menu: 'mneTools'
        },
        children: [
            {
                path: ':projectId',
                component: GanttComponent,
                canActivate: [AccessGuard],
                canActivateChild: [AccessGuard],
                data: {
                    breadcrumb: 'Add Gantt Chart',
                    menu: 'mneTools'
                }
            }
        ]
    },
    {
        path: 'tools',
        canActivate: [AccessGuard],
        canActivateChild: [AccessGuard],
        component: ToolsComponent,
        pathMatch: 'full',
        data: {
            breadcrumb: 'Tools',
            menu: 'admin'
        },
    },
    {
        path: 'folder',
        canActivate: [AccessGuard],
        canActivateChild: [AccessGuard],
        component: FolderComponent,
        data: {
            breadcrumb: 'Folder',
            menu: 'mneTools'
        },
        children: [
            {
                path: '**', component: FolderComponent
            }
        ]
    },
    {
        path: 'errors',
        canActivate: [AccessGuard],
        canActivateChild: [AccessGuard],
        component: ErrorsComponent,
        data: {
            breadcrumb: 'Errors',
            menu: null
        },
        children: [
            {
                path: ':id',
                component: ErrorComponent,
                canActivate: [AccessGuard],
                canActivateChild: [AccessGuard],
                data: {
                    breadcrumb: 'Error',
                    menu: null

                }
            }
        ]
    }
];
