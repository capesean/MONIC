import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PublicRoutes } from './public.routes';
import { PublicComponent } from './public.component';
import { ResponseComponent } from './response.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from '../shared.module';
import { QuestionnaireComponent } from './questionnaire.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        RouterModule.forChild(PublicRoutes),
        NgbModule,
        SharedModule,
    ],
    declarations: [
        PublicComponent,
        ResponseComponent,
        QuestionnaireComponent
    ]
})
export class PublicModule { }
