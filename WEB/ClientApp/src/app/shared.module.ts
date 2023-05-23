import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MainComponent } from './main.component';
import { BreadcrumbComponent } from './common/components/breadcrumb.component';
import { ColorComponent } from './common/components/color.component';
import { ConfirmModalComponent } from './common/components/confirm.component';
import { FileComponent } from './common/components/file.component';
import { HeaderComponent } from './common/components/header.component';
import { NavMenuComponent } from './common/components/nav-menu.component';
import { PagerComponent } from './common/components/pager.component';
import { PageTitleComponent } from './common/components/pagetitle.component';
import { SortIconComponent } from './common/components/sorticon.component';
import { AppHasRoleDirective } from './common/directives/apphasrole';
import { AppFileInputDirective } from './common/directives/appfileinput';
import { SpyOnDirective } from './common/scroll-spy/spy-on.directive';
import { BooleanPipe } from './common/pipes/booleanpipe';
import { MomentPipe } from './common/pipes/momentpipe';
import { AnswerSelectComponent } from './admin/answers/answer.select.component';
import { AnswerModalComponent } from './admin/answers/answer.modal.component';
import { CategorySelectComponent } from './admin/categories/category.select.component';
import { CategoryModalComponent } from './admin/categories/category.modal.component';
import { CategorySortComponent } from './admin/categories/category.sort.component';
import { ComponentSelectComponent } from './admin/components/component.select.component';
import { ComponentModalComponent } from './admin/components/component.modal.component';
import { ComponentSortComponent } from './admin/components/component.sort.component';
import { DataReviewSelectComponent } from './admin/datareviews/datareview.select.component';
import { DataReviewModalComponent } from './admin/datareviews/datareview.modal.component';
import { DateSelectComponent } from './admin/dates/date.select.component';
import { DateModalComponent } from './admin/dates/date.modal.component';
import { DateSortComponent } from './admin/dates/date.sort.component';
import { DocumentSelectComponent } from './admin/documents/document.select.component';
import { DocumentModalComponent } from './admin/documents/document.modal.component';
import { EntitySelectComponent } from './admin/entities/entity.select.component';
import { EntityModalComponent } from './admin/entities/entity.modal.component';
import { EntityTypeSelectComponent } from './admin/entitytypes/entitytype.select.component';
import { EntityTypeModalComponent } from './admin/entitytypes/entitytype.modal.component';
import { EntityTypeSortComponent } from './admin/entitytypes/entitytype.sort.component';
import { FieldSelectComponent } from './admin/fields/field.select.component';
import { FieldModalComponent } from './admin/fields/field.modal.component';
import { FieldSortComponent } from './admin/fields/field.sort.component';
import { FolderSelectComponent } from './admin/folders/folder.select.component';
import { FolderModalComponent } from './admin/folders/folder.modal.component';
import { FolderContentSelectComponent } from './admin/foldercontents/foldercontent.select.component';
import { FolderContentModalComponent } from './admin/foldercontents/foldercontent.modal.component';
import { GroupSelectComponent } from './admin/groups/group.select.component';
import { GroupModalComponent } from './admin/groups/group.modal.component';
import { GroupSortComponent } from './admin/groups/group.sort.component';
import { IndicatorSelectComponent } from './admin/indicators/indicator.select.component';
import { IndicatorModalComponent } from './admin/indicators/indicator.modal.component';
import { IndicatorSortComponent } from './admin/indicators/indicator.sort.component';
import { ItemSelectComponent } from './admin/items/item.select.component';
import { ItemModalComponent } from './admin/items/item.modal.component';
import { LogFrameSelectComponent } from './admin/logframes/logframe.select.component';
import { LogFrameModalComponent } from './admin/logframes/logframe.modal.component';
import { LogFrameRowSelectComponent } from './admin/logframerows/logframerow.select.component';
import { LogFrameRowModalComponent } from './admin/logframerows/logframerow.modal.component';
import { LogFrameRowSortComponent } from './admin/logframerows/logframerow.sort.component';
import { MilestoneSelectComponent } from './admin/milestones/milestone.select.component';
import { MilestoneModalComponent } from './admin/milestones/milestone.modal.component';
import { MilestoneSortComponent } from './admin/milestones/milestone.sort.component';
import { OptionSelectComponent } from './admin/options/option.select.component';
import { OptionModalComponent } from './admin/options/option.modal.component';
import { OptionSortComponent } from './admin/options/option.sort.component';
import { OrganisationSelectComponent } from './admin/organisations/organisation.select.component';
import { OrganisationModalComponent } from './admin/organisations/organisation.modal.component';
import { ProjectSelectComponent } from './admin/projects/project.select.component';
import { ProjectModalComponent } from './admin/projects/project.modal.component';
import { QuestionSelectComponent } from './admin/questions/question.select.component';
import { QuestionModalComponent } from './admin/questions/question.modal.component';
import { QuestionSortComponent } from './admin/questions/question.sort.component';
import { QuestionnaireSelectComponent } from './admin/questionnaires/questionnaire.select.component';
import { QuestionnaireModalComponent } from './admin/questionnaires/questionnaire.modal.component';
import { QuestionOptionSelectComponent } from './admin/questionoptions/questionoption.select.component';
import { QuestionOptionModalComponent } from './admin/questionoptions/questionoption.modal.component';
import { QuestionOptionSortComponent } from './admin/questionoptions/questionoption.sort.component';
import { QuestionOptionGroupSelectComponent } from './admin/questionoptiongroups/questionoptiongroup.select.component';
import { QuestionOptionGroupModalComponent } from './admin/questionoptiongroups/questionoptiongroup.modal.component';
import { RelationshipSelectComponent } from './admin/relationships/relationship.select.component';
import { RelationshipModalComponent } from './admin/relationships/relationship.modal.component';
import { ResponseSelectComponent } from './admin/responses/response.select.component';
import { ResponseModalComponent } from './admin/responses/response.modal.component';
import { SectionSelectComponent } from './admin/sections/section.select.component';
import { SectionModalComponent } from './admin/sections/section.modal.component';
import { SectionSortComponent } from './admin/sections/section.sort.component';
import { SubcategorySelectComponent } from './admin/subcategories/subcategory.select.component';
import { SubcategoryModalComponent } from './admin/subcategories/subcategory.modal.component';
import { SubcategorySortComponent } from './admin/subcategories/subcategory.sort.component';
import { TaskSelectComponent } from './admin/tasks/task.select.component';
import { TaskModalComponent } from './admin/tasks/task.modal.component';
import { TheoryOfChangeSelectComponent } from './admin/theoriesofchange/theoryofchange.select.component';
import { TheoryOfChangeModalComponent } from './admin/theoriesofchange/theoryofchange.modal.component';
import { UserSelectComponent } from './admin/users/user.select.component';
import { UserModalComponent } from './admin/users/user.modal.component';
import { GroupPipe } from './common/pipes/grouppipe';
import { FieldComponent } from './common/components/field.component';
import { FieldSizePipe } from './common/pipes/fieldsizepipe';
import { DocumentManageComponent } from './admin/documents/document.manage.component';
import { QuestionLogicModalComponent } from './admin/questions/questionlogic.component';
import { SurveyComponent } from './common/components/survey/survey.component';
import { ParagraphsPipe } from './common/pipes/paragraphspipe';
import { QuestionnaireExportComponent } from './admin/questionnaires/questionnaire.export.component';
import { QuestionnaireDownloadComponent } from './admin/questionnaires/questionnaire.download.component';
import { FileSizePipe } from './common/pipes/filesizepipe';
import { QuillModule } from 'ngx-quill';
import { QuestionnaireGenerateSummariesComponent } from './admin/questionnaires/questionnaire.generate.summaries.component';
import { FrequencyAdverb } from './common/pipes/frequencyadverbpipe';

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        FormsModule,
        NgbModule,
        DragDropModule,
        QuillModule
    ],
    declarations: [
        MainComponent,
        NavMenuComponent,
        HeaderComponent,
        ConfirmModalComponent,
        PagerComponent,
        SortIconComponent,
        FileComponent,
        ColorComponent,
        BreadcrumbComponent,
        PageTitleComponent,
        MomentPipe,
        BooleanPipe,
        AppFileInputDirective,
        AppHasRoleDirective,
        GroupPipe,
        ParagraphsPipe,
        FieldComponent,
        FieldSizePipe,
        DocumentManageComponent,
        HeaderComponent,
        QuestionLogicModalComponent,
        QuestionnaireExportComponent,
        QuestionnaireDownloadComponent,
        QuestionnaireGenerateSummariesComponent,
        SurveyComponent,
        FileSizePipe,
        FrequencyAdverb,
        SpyOnDirective,
        AnswerSelectComponent,
        AnswerModalComponent,
        CategorySelectComponent,
        CategoryModalComponent,
        CategorySortComponent,
        ComponentSelectComponent,
        ComponentModalComponent,
        ComponentSortComponent,
        DataReviewSelectComponent,
        DataReviewModalComponent,
        DateSelectComponent,
        DateModalComponent,
        DateSortComponent,
        DocumentSelectComponent,
        DocumentModalComponent,
        EntitySelectComponent,
        EntityModalComponent,
        EntityTypeSelectComponent,
        EntityTypeModalComponent,
        EntityTypeSortComponent,
        FieldSelectComponent,
        FieldModalComponent,
        FieldSortComponent,
        FolderSelectComponent,
        FolderModalComponent,
        FolderContentSelectComponent,
        FolderContentModalComponent,
        GroupSelectComponent,
        GroupModalComponent,
        GroupSortComponent,
        IndicatorSelectComponent,
        IndicatorModalComponent,
        IndicatorSortComponent,
        ItemSelectComponent,
        ItemModalComponent,
        LogFrameSelectComponent,
        LogFrameModalComponent,
        LogFrameRowSelectComponent,
        LogFrameRowModalComponent,
        LogFrameRowSortComponent,
        MilestoneSelectComponent,
        MilestoneModalComponent,
        MilestoneSortComponent,
        OptionSelectComponent,
        OptionModalComponent,
        OptionSortComponent,
        OrganisationSelectComponent,
        OrganisationModalComponent,
        ProjectSelectComponent,
        ProjectModalComponent,
        QuestionSelectComponent,
        QuestionModalComponent,
        QuestionSortComponent,
        QuestionnaireSelectComponent,
        QuestionnaireModalComponent,
        QuestionOptionSelectComponent,
        QuestionOptionModalComponent,
        QuestionOptionSortComponent,
        QuestionOptionGroupSelectComponent,
        QuestionOptionGroupModalComponent,
        RelationshipSelectComponent,
        RelationshipModalComponent,
        ResponseSelectComponent,
        ResponseModalComponent,
        SectionSelectComponent,
        SectionModalComponent,
        SectionSortComponent,
        SubcategorySelectComponent,
        SubcategoryModalComponent,
        SubcategorySortComponent,
        TaskSelectComponent,
        TaskModalComponent,
        TheoryOfChangeSelectComponent,
        TheoryOfChangeModalComponent,
        UserSelectComponent,
        UserModalComponent
    ],
    exports: [
        MainComponent,
        NavMenuComponent,
        HeaderComponent,
        ConfirmModalComponent,
        PagerComponent,
        SortIconComponent,
        FileComponent,
        ColorComponent,
        BreadcrumbComponent,
        PageTitleComponent,
        MomentPipe,
        BooleanPipe,
        AppFileInputDirective,
        AppHasRoleDirective,
        GroupPipe,
        ParagraphsPipe,
        FieldComponent,
        FieldSizePipe,
        DocumentManageComponent,
        HeaderComponent,
        QuestionLogicModalComponent,
        QuestionnaireExportComponent,
        QuestionnaireDownloadComponent,
        QuestionnaireGenerateSummariesComponent,
        SurveyComponent,
        FileSizePipe,
        FrequencyAdverb,
        SpyOnDirective,
        AnswerSelectComponent,
        AnswerModalComponent,
        CategorySelectComponent,
        CategoryModalComponent,
        CategorySortComponent,
        ComponentSelectComponent,
        ComponentModalComponent,
        ComponentSortComponent,
        DataReviewSelectComponent,
        DataReviewModalComponent,
        DateSelectComponent,
        DateModalComponent,
        DateSortComponent,
        DocumentSelectComponent,
        DocumentModalComponent,
        EntitySelectComponent,
        EntityModalComponent,
        EntityTypeSelectComponent,
        EntityTypeModalComponent,
        EntityTypeSortComponent,
        FieldSelectComponent,
        FieldModalComponent,
        FieldSortComponent,
        FolderSelectComponent,
        FolderModalComponent,
        FolderContentSelectComponent,
        FolderContentModalComponent,
        GroupSelectComponent,
        GroupModalComponent,
        GroupSortComponent,
        IndicatorSelectComponent,
        IndicatorModalComponent,
        IndicatorSortComponent,
        ItemSelectComponent,
        ItemModalComponent,
        LogFrameSelectComponent,
        LogFrameModalComponent,
        LogFrameRowSelectComponent,
        LogFrameRowModalComponent,
        LogFrameRowSortComponent,
        MilestoneSelectComponent,
        MilestoneModalComponent,
        MilestoneSortComponent,
        OptionSelectComponent,
        OptionModalComponent,
        OptionSortComponent,
        OrganisationSelectComponent,
        OrganisationModalComponent,
        ProjectSelectComponent,
        ProjectModalComponent,
        QuestionSelectComponent,
        QuestionModalComponent,
        QuestionSortComponent,
        QuestionnaireSelectComponent,
        QuestionnaireModalComponent,
        QuestionOptionSelectComponent,
        QuestionOptionModalComponent,
        QuestionOptionSortComponent,
        QuestionOptionGroupSelectComponent,
        QuestionOptionGroupModalComponent,
        RelationshipSelectComponent,
        RelationshipModalComponent,
        ResponseSelectComponent,
        ResponseModalComponent,
        SectionSelectComponent,
        SectionModalComponent,
        SectionSortComponent,
        SubcategorySelectComponent,
        SubcategoryModalComponent,
        SubcategorySortComponent,
        TaskSelectComponent,
        TaskModalComponent,
        TheoryOfChangeSelectComponent,
        TheoryOfChangeModalComponent,
        UserSelectComponent,
        UserModalComponent
    ]
})
export class SharedModule { }
