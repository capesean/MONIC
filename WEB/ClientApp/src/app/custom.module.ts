import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { SharedModule } from './shared.module';
import { StrongPasswordModule } from './common/zxcvbn/strong-password.module';
//import { NgxGraphModule } from '@swimlane/ngx-graph';
//import { NgxChartsModule } from '@swimlane/ngx-charts';
import { HomeComponent } from './home/home.component';
import { AccountComponent } from './account/account.component';
import { ErrorsComponent } from './error/errors.component';
import { ErrorComponent } from './error/error.component';
import { SetupComponent } from './setup/setup.component';
import { DataEntryComponent } from './forms/dataentry.component';
import { TheoriesOfChangeComponent } from './theoryofchange/theoriesofchange';
import { TheoryOfChangeComponentModal } from './theoryofchange/theoryofchangecomponent.modal';
import { TheoryOfChangeRelationshipModal } from './theoryofchange/theoryofchangerelationship.modal';
// removed because ngx-graph is not supported
//import { TheoryOfChangeComponent } from './theoryofchange/theoryofchange';
import { LogFramesComponent } from './logframe/logframes.component';
import { LogFrameComponent } from './logframe/logframe.component';
import { LogFrameRowViewComponent } from './logframe/logframe.row.component';
import { LogFrameRowsComponent } from './logframe/logframerows.component';
import { LogFrameRowPipe } from './common/pipes/logframerowpipe';
import { GanttsComponent } from './gantt/gantts.component';
import { GanttComponent } from './gantt/gantt.component';
import { GanttTaskComponent } from './gantt/gantt.task.component';
import { GanttMilestoneComponent } from './gantt/gantt.milestone.component';
import { QuestionnaireComponent } from './questionnaire/questionnaire.component';
import { QuestionnairesComponent } from './questionnaire/questionnaires.component';
import { DatumStatusModalComponent } from './forms/datumstatus.modal.component';
import { AddIndicatorsPermissionModal } from './admin/users/addindicatorpermissions.modal';
import { DataReviewModalComponent } from './forms/datareview.modal';
import { NgxEchartsModule } from 'ngx-echarts';
import { IndicatorLineChartComponent } from './common/widgets/indicator.linechart.component';
import { IndicatorBarChartComponent } from './common/widgets/indicator.barchart.component';
import { IndicatorMapComponent } from './common/widgets/indicator.map.component';
import { IndicatorPieChartComponent } from './common/widgets/indicator.piechart.component';
import { ToolsComponent } from './tools/tools.component';
import { IndicatorMapSettingsComponent } from './common/widgets/indicator.map.settings.component';
import { WidgetComponent } from './common/widgets/widget.component';
import { IndicatorLineChartSettingsComponent } from './common/widgets/indicator.linechart.settings.component';
import { IndicatorBarChartSettingsComponent } from './common/widgets/indicator.barchart.settings.component';
import { IndicatorPieChartSettingsComponent } from './common/widgets/indicator.piechart.settings.component';
import { QuestionnaireBarChartSettingsComponent } from './common/widgets/questionnaire.barchart.settings.component';
import { QuestionnaireBarChartComponent } from './common/widgets/questionnaire.barchart.component';
import { GoogleMapsModule } from '@angular/google-maps';
import { CustomRoutes } from './custom.routes';
import { FolderComponent } from './folder/folder.component';
import { FolderViewComponent } from './common/components/folderview.component';
import { FolderShortcutComponent } from './common/widgets/folder.shortcut.component';
import { FolderShortcutSettingsComponent } from './common/widgets/folder.shortcut.settings.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        RouterModule.forChild(CustomRoutes),
        NgbModule,
        DragDropModule,
        SharedModule,
        StrongPasswordModule,
        //NgxGraphModule,
        //NgxChartsModule,
        NgxEchartsModule.forRoot({
            echarts: () => import('echarts')
        }),
        GoogleMapsModule
    ],
    declarations: [
        HomeComponent,
        AccountComponent,
        ErrorsComponent,
        ErrorComponent,
        SetupComponent,
        DataEntryComponent,
        TheoriesOfChangeComponent,
        //TheoryOfChangeComponent,
        TheoryOfChangeComponentModal,
        TheoryOfChangeRelationshipModal,
        LogFramesComponent,
        LogFrameComponent,
        LogFrameRowViewComponent,
        LogFrameRowsComponent,
        LogFrameRowPipe,
        GanttsComponent,
        GanttComponent,
        GanttTaskComponent,
        GanttMilestoneComponent,
        QuestionnairesComponent,
        QuestionnaireComponent,
        DatumStatusModalComponent,
        AddIndicatorsPermissionModal,
        DataReviewModalComponent,
        IndicatorLineChartComponent,
        IndicatorBarChartComponent,
        IndicatorMapComponent,
        IndicatorPieChartComponent,
        ToolsComponent,
        WidgetComponent,
        IndicatorMapSettingsComponent,
        IndicatorLineChartSettingsComponent,
        IndicatorBarChartSettingsComponent,
        IndicatorPieChartSettingsComponent,
        QuestionnaireBarChartSettingsComponent,
        QuestionnaireBarChartComponent,
        FolderComponent,
        FolderViewComponent,
        FolderShortcutComponent,
        FolderShortcutSettingsComponent
    ],
    exports: [
        GanttComponent,
        LogFrameRowPipe,
        FolderViewComponent
    ]
})
export class CustomModule { }
