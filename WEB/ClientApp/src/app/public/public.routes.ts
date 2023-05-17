import { Route } from '@angular/router';
import { PublicComponent } from './public.component';
import { QuestionnaireComponent } from './questionnaire.component';
import { ResponseComponent } from './response.component';

export const PublicRoutes: Route[] = [
    {
        path: '',
        component: PublicComponent,
        children: [
            {
                path: 'response/:publicCode',
                component: ResponseComponent
            },
            {
                path: 'questionnaire/:publicCode',
                component: QuestionnaireComponent
            }
        ]
    }
];

