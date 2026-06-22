import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from './shared.module';
import { GeneratedRoutes } from './generated.routes';
import { AnswerListComponent } from './admin/answers/answer.list.component';
import { AnswerEditComponent } from './admin/answers/answer.edit.component';
import { AnswerOptionListComponent } from './admin/answeroptions/answeroption.list.component';
import { AnswerOptionEditComponent } from './admin/answeroptions/answeroption.edit.component';
import { CategoryListComponent } from './admin/categories/category.list.component';
import { CategoryEditComponent } from './admin/categories/category.edit.component';
import { ChartListComponent } from './admin/charts/chart.list.component';
import { ChartEditComponent } from './admin/charts/chart.edit.component';
import { ComponentListComponent } from './admin/components/component.list.component';
import { ComponentEditComponent } from './admin/components/component.edit.component';
import { ComponentIndicatorListComponent } from './admin/componentindicators/componentindicator.list.component';
import { ComponentIndicatorEditComponent } from './admin/componentindicators/componentindicator.edit.component';
import { DataReviewListComponent } from './admin/datareviews/datareview.list.component';
import { DataReviewEditComponent } from './admin/datareviews/datareview.edit.component';
import { DateListComponent } from './admin/dates/date.list.component';
import { DateEditComponent } from './admin/dates/date.edit.component';
import { DatumListComponent } from './admin/data/datum.list.component';
import { DatumEditComponent } from './admin/data/datum.edit.component';
import { DocumentListComponent } from './admin/documents/document.list.component';
import { DocumentEditComponent } from './admin/documents/document.edit.component';
import { EntityListComponent } from './admin/entities/entity.list.component';
import { EntityEditComponent } from './admin/entities/entity.edit.component';
import { EntityLinkListComponent } from './admin/entitylinks/entitylink.list.component';
import { EntityLinkEditComponent } from './admin/entitylinks/entitylink.edit.component';
import { EntityPermissionListComponent } from './admin/entitypermissions/entitypermission.list.component';
import { EntityPermissionEditComponent } from './admin/entitypermissions/entitypermission.edit.component';
import { EntityTypeListComponent } from './admin/entitytypes/entitytype.list.component';
import { EntityTypeEditComponent } from './admin/entitytypes/entitytype.edit.component';
import { FieldListComponent } from './admin/fields/field.list.component';
import { FieldEditComponent } from './admin/fields/field.edit.component';
import { FolderListComponent } from './admin/folders/folder.list.component';
import { FolderEditComponent } from './admin/folders/folder.edit.component';
import { FolderContentListComponent } from './admin/foldercontents/foldercontent.list.component';
import { FolderContentEditComponent } from './admin/foldercontents/foldercontent.edit.component';
import { GroupListComponent } from './admin/groups/group.list.component';
import { GroupEditComponent } from './admin/groups/group.edit.component';
import { IndicatorListComponent } from './admin/indicators/indicator.list.component';
import { IndicatorEditComponent } from './admin/indicators/indicator.edit.component';
import { IndicatorDateListComponent } from './admin/indicatordates/indicatordate.list.component';
import { IndicatorDateEditComponent } from './admin/indicatordates/indicatordate.edit.component';
import { IndicatorPermissionListComponent } from './admin/indicatorpermissions/indicatorpermission.list.component';
import { IndicatorPermissionEditComponent } from './admin/indicatorpermissions/indicatorpermission.edit.component';
import { ItemListComponent } from './admin/items/item.list.component';
import { ItemEditComponent } from './admin/items/item.edit.component';
import { ItemFieldListComponent } from './admin/itemfields/itemfield.list.component';
import { ItemFieldEditComponent } from './admin/itemfields/itemfield.edit.component';
import { ItemOptionListComponent } from './admin/itemoptions/itemoption.list.component';
import { ItemOptionEditComponent } from './admin/itemoptions/itemoption.edit.component';
import { LogFrameListComponent } from './admin/logframes/logframe.list.component';
import { LogFrameEditComponent } from './admin/logframes/logframe.edit.component';
import { LogFrameRowListComponent } from './admin/logframerows/logframerow.list.component';
import { LogFrameRowEditComponent } from './admin/logframerows/logframerow.edit.component';
import { LogFrameRowComponentListComponent } from './admin/logframerowcomponents/logframerowcomponent.list.component';
import { LogFrameRowComponentEditComponent } from './admin/logframerowcomponents/logframerowcomponent.edit.component';
import { LogFrameRowIndicatorListComponent } from './admin/logframerowindicators/logframerowindicator.list.component';
import { LogFrameRowIndicatorEditComponent } from './admin/logframerowindicators/logframerowindicator.edit.component';
import { MilestoneListComponent } from './admin/milestones/milestone.list.component';
import { MilestoneEditComponent } from './admin/milestones/milestone.edit.component';
import { OptionListComponent } from './admin/options/option.list.component';
import { OptionEditComponent } from './admin/options/option.edit.component';
import { OptionListListComponent } from './admin/optionlists/optionlist.list.component';
import { OptionListEditComponent } from './admin/optionlists/optionlist.edit.component';
import { OrganisationListComponent } from './admin/organisations/organisation.list.component';
import { OrganisationEditComponent } from './admin/organisations/organisation.edit.component';
import { ProjectListComponent } from './admin/projects/project.list.component';
import { ProjectEditComponent } from './admin/projects/project.edit.component';
import { QuestionListComponent } from './admin/questions/question.list.component';
import { QuestionEditComponent } from './admin/questions/question.edit.component';
import { QuestionnaireListComponent } from './admin/questionnaires/questionnaire.list.component';
import { QuestionnaireEditComponent } from './admin/questionnaires/questionnaire.edit.component';
import { QuestionOptionListComponent } from './admin/questionoptions/questionoption.list.component';
import { QuestionOptionEditComponent } from './admin/questionoptions/questionoption.edit.component';
import { QuestionOptionGroupListComponent } from './admin/questionoptiongroups/questionoptiongroup.list.component';
import { QuestionOptionGroupEditComponent } from './admin/questionoptiongroups/questionoptiongroup.edit.component';
import { QuestionSummaryListComponent } from './admin/questionsummaries/questionsummary.list.component';
import { QuestionSummaryEditComponent } from './admin/questionsummaries/questionsummary.edit.component';
import { RelationshipListComponent } from './admin/relationships/relationship.list.component';
import { RelationshipEditComponent } from './admin/relationships/relationship.edit.component';
import { ResponseListComponent } from './admin/responses/response.list.component';
import { ResponseEditComponent } from './admin/responses/response.edit.component';
import { SectionListComponent } from './admin/sections/section.list.component';
import { SectionEditComponent } from './admin/sections/section.edit.component';
import { SettingsEditComponent } from './admin/settings/settings.edit.component';
import { SkipLogicOptionListComponent } from './admin/skiplogicoptions/skiplogicoption.list.component';
import { SkipLogicOptionEditComponent } from './admin/skiplogicoptions/skiplogicoption.edit.component';
import { SubcategoryListComponent } from './admin/subcategories/subcategory.list.component';
import { SubcategoryEditComponent } from './admin/subcategories/subcategory.edit.component';
import { TaskListComponent } from './admin/tasks/task.list.component';
import { TaskEditComponent } from './admin/tasks/task.edit.component';
import { TheoryOfChangeListComponent } from './admin/theoriesofchange/theoryofchange.list.component';
import { TheoryOfChangeEditComponent } from './admin/theoriesofchange/theoryofchange.edit.component';
import { TheoryOfChangeComponentListComponent } from './admin/theoryofchangecomponents/theoryofchangecomponent.list.component';
import { TheoryOfChangeComponentEditComponent } from './admin/theoryofchangecomponents/theoryofchangecomponent.edit.component';
import { TokenListComponent } from './admin/tokens/token.list.component';
import { TokenEditComponent } from './admin/tokens/token.edit.component';
import { UserListComponent } from './admin/users/user.list.component';
import { UserEditComponent } from './admin/users/user.edit.component';
import { NgxEchartsModule } from 'ngx-echarts';

@NgModule({
    declarations: [
        AnswerListComponent,
        AnswerEditComponent,
        AnswerOptionListComponent,
        AnswerOptionEditComponent,
        CategoryListComponent,
        CategoryEditComponent,
        ChartListComponent,
        ChartEditComponent,
        ComponentListComponent,
        ComponentEditComponent,
        ComponentIndicatorListComponent,
        ComponentIndicatorEditComponent,
        DataReviewListComponent,
        DataReviewEditComponent,
        DateListComponent,
        DateEditComponent,
        DatumListComponent,
        DatumEditComponent,
        DocumentListComponent,
        DocumentEditComponent,
        EntityListComponent,
        EntityEditComponent,
        EntityLinkListComponent,
        EntityLinkEditComponent,
        EntityPermissionListComponent,
        EntityPermissionEditComponent,
        EntityTypeListComponent,
        EntityTypeEditComponent,
        FieldListComponent,
        FieldEditComponent,
        FolderListComponent,
        FolderEditComponent,
        FolderContentListComponent,
        FolderContentEditComponent,
        GroupListComponent,
        GroupEditComponent,
        IndicatorListComponent,
        IndicatorEditComponent,
        IndicatorDateListComponent,
        IndicatorDateEditComponent,
        IndicatorPermissionListComponent,
        IndicatorPermissionEditComponent,
        ItemListComponent,
        ItemEditComponent,
        ItemFieldListComponent,
        ItemFieldEditComponent,
        ItemOptionListComponent,
        ItemOptionEditComponent,
        LogFrameListComponent,
        LogFrameEditComponent,
        LogFrameRowListComponent,
        LogFrameRowEditComponent,
        LogFrameRowComponentListComponent,
        LogFrameRowComponentEditComponent,
        LogFrameRowIndicatorListComponent,
        LogFrameRowIndicatorEditComponent,
        MilestoneListComponent,
        MilestoneEditComponent,
        OptionListComponent,
        OptionEditComponent,
        OptionListListComponent,
        OptionListEditComponent,
        OrganisationListComponent,
        OrganisationEditComponent,
        ProjectListComponent,
        ProjectEditComponent,
        QuestionListComponent,
        QuestionEditComponent,
        QuestionnaireListComponent,
        QuestionnaireEditComponent,
        QuestionOptionListComponent,
        QuestionOptionEditComponent,
        QuestionOptionGroupListComponent,
        QuestionOptionGroupEditComponent,
        QuestionSummaryListComponent,
        QuestionSummaryEditComponent,
        RelationshipListComponent,
        RelationshipEditComponent,
        ResponseListComponent,
        ResponseEditComponent,
        SectionListComponent,
        SectionEditComponent,
        SettingsEditComponent,
        SkipLogicOptionListComponent,
        SkipLogicOptionEditComponent,
        SubcategoryListComponent,
        SubcategoryEditComponent,
        TaskListComponent,
        TaskEditComponent,
        TheoryOfChangeListComponent,
        TheoryOfChangeEditComponent,
        TheoryOfChangeComponentListComponent,
        TheoryOfChangeComponentEditComponent,
        TokenListComponent,
        TokenEditComponent,
        UserListComponent,
        UserEditComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        RouterModule.forChild(GeneratedRoutes),
        NgbModule,
        DragDropModule,
        SharedModule,
        NgxEchartsModule
    ]
})
export class GeneratedModule { }
