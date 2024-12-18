import { Route } from '@angular/router';
import { AccessGuard } from './common/auth/auth.accessguard';
import { AnswerListComponent } from './admin/answers/answer.list.component';
import { AnswerEditComponent } from './admin/answers/answer.edit.component';
import { AnswerOptionListComponent } from './admin/answeroptions/answeroption.list.component';
import { AnswerOptionEditComponent } from './admin/answeroptions/answeroption.edit.component';
import { CategoryListComponent } from './admin/categories/category.list.component';
import { CategoryEditComponent } from './admin/categories/category.edit.component';
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
import { FieldValueListComponent } from './admin/fieldvalues/fieldvalue.list.component';
import { FieldValueEditComponent } from './admin/fieldvalues/fieldvalue.edit.component';
import { FolderListComponent } from './admin/folders/folder.list.component';
import { FolderEditComponent } from './admin/folders/folder.edit.component';
import { FolderContentListComponent } from './admin/foldercontents/foldercontent.list.component';
import { FolderContentEditComponent } from './admin/foldercontents/foldercontent.edit.component';
import { GroupListComponent } from './admin/groups/group.list.component';
import { GroupEditComponent } from './admin/groups/group.edit.component';
import { IndicatorListComponent } from './admin/indicators/indicator.list.component';
import { IndicatorEditComponent } from './admin/indicators/indicator.edit.component';
import { IndicatorPermissionListComponent } from './admin/indicatorpermissions/indicatorpermission.list.component';
import { IndicatorPermissionEditComponent } from './admin/indicatorpermissions/indicatorpermission.edit.component';
import { ItemListComponent } from './admin/items/item.list.component';
import { ItemEditComponent } from './admin/items/item.edit.component';
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
import { OptionValueListComponent } from './admin/optionvalues/optionvalue.list.component';
import { OptionValueEditComponent } from './admin/optionvalues/optionvalue.edit.component';
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

export const GeneratedRoutes: Route[] = [
    {
        path: 'answers',
        canActivate: [AccessGuard],
        canActivateChild: [AccessGuard],
        component: AnswerListComponent,
        data: {
            submenu: 'answers',
            breadcrumb: 'Answers'
        }
    },
    {
        path: 'answeroptions',
        canActivate: [AccessGuard],
        canActivateChild: [AccessGuard],
        component: AnswerOptionListComponent,
        data: {
            submenu: 'answerOptions',
            breadcrumb: 'Answer Options'
        }
    },
    {
        path: 'categories',
        canActivate: [AccessGuard],
        canActivateChild: [AccessGuard],
        component: CategoryListComponent,
        data: {
            menu: 'admin',
            submenu: 'categories',
            breadcrumb: 'Categories'
        },
        children: [
            {
                path: ':categoryId',
                component: CategoryEditComponent,
                canActivate: [AccessGuard],
                canActivateChild: [AccessGuard],
                data: {
                    menu: 'admin',
                    submenu: 'categories',
                    breadcrumb: 'Add Category'
                },
                children: [
                    {
                        path: 'subcategories/:subcategoryId',
                        component: SubcategoryEditComponent,
                        canActivate: [AccessGuard],
                        canActivateChild: [AccessGuard],
                        data: {
                            menu: 'admin',
                            submenu: 'subcategories',
                            breadcrumb: 'Add Subcategory'
                        }
                    }
                ]
            }
        ]
    },
    {
        path: 'components',
        canActivate: [AccessGuard],
        canActivateChild: [AccessGuard],
        component: ComponentListComponent,
        data: {
            menu: 'admin',
            submenu: 'components',
            breadcrumb: 'Components'
        },
        children: [
            {
                path: ':componentId',
                component: ComponentEditComponent,
                canActivate: [AccessGuard],
                canActivateChild: [AccessGuard],
                data: {
                    menu: 'admin',
                    submenu: 'components',
                    breadcrumb: 'Add Component'
                },
                children: [
                    {
                        path: 'componentindicators/:indicatorId',
                        component: ComponentIndicatorEditComponent,
                        canActivate: [AccessGuard],
                        canActivateChild: [AccessGuard],
                        data: {
                            menu: 'admin',
                            submenu: 'componentIndicators',
                            breadcrumb: 'Add Component Indicator'
                        }
                    }
                ]
            }
        ]
    },
    {
        path: 'componentindicators',
        canActivate: [AccessGuard],
        canActivateChild: [AccessGuard],
        component: ComponentIndicatorListComponent,
        data: {
            submenu: 'componentIndicators',
            breadcrumb: 'Component Indicators'
        }
    },
    {
        path: 'datareviews',
        canActivate: [AccessGuard],
        canActivateChild: [AccessGuard],
        component: DataReviewListComponent,
        data: {
            menu: 'admin',
            submenu: 'dataReviews',
            breadcrumb: 'Data Reviews'
        },
        children: [
            {
                path: ':dataReviewId',
                component: DataReviewEditComponent,
                canActivate: [AccessGuard],
                canActivateChild: [AccessGuard],
                data: {
                    menu: 'admin',
                    submenu: 'dataReviews',
                    breadcrumb: 'Add Data Review'
                }
            }
        ]
    },
    {
        path: 'dates',
        canActivate: [AccessGuard],
        canActivateChild: [AccessGuard],
        component: DateListComponent,
        data: {
            menu: 'admin',
            submenu: 'dates',
            breadcrumb: 'Dates'
        },
        children: [
            {
                path: ':dateId',
                component: DateEditComponent,
                canActivate: [AccessGuard],
                canActivateChild: [AccessGuard],
                data: {
                    menu: 'admin',
                    submenu: 'dates',
                    breadcrumb: 'Add Date'
                }
            }
        ]
    },
    {
        path: 'data',
        canActivate: [AccessGuard],
        canActivateChild: [AccessGuard],
        component: DatumListComponent,
        data: {
            menu: 'admin',
            submenu: 'data',
            breadcrumb: 'Data'
        },
        children: [
            {
                path: ':indicatorId/:entityId/:dateId',
                component: DatumEditComponent,
                canActivate: [AccessGuard],
                canActivateChild: [AccessGuard],
                data: {
                    menu: 'admin',
                    submenu: 'data',
                    breadcrumb: 'Add Datum'
                }
            }
        ]
    },
    {
        path: 'documents',
        canActivate: [AccessGuard],
        canActivateChild: [AccessGuard],
        component: DocumentListComponent,
        data: {
            menu: 'admin',
            submenu: 'documents',
            breadcrumb: 'Documents'
        }
    },
    {
        path: 'entities',
        canActivate: [AccessGuard],
        canActivateChild: [AccessGuard],
        component: EntityListComponent,
        data: {
            menu: 'admin',
            submenu: 'entities',
            breadcrumb: 'Entities'
        },
        children: [
            {
                path: ':entityId',
                component: EntityEditComponent,
                canActivate: [AccessGuard],
                canActivateChild: [AccessGuard],
                data: {
                    menu: 'admin',
                    submenu: 'entities',
                    breadcrumb: 'Add Entity'
                }
            }
        ]
    },
    {
        path: 'entitylinks',
        canActivate: [AccessGuard],
        canActivateChild: [AccessGuard],
        component: EntityLinkListComponent,
        data: {
            menu: 'admin',
            submenu: 'entityLinks',
            breadcrumb: 'Entity Links'
        },
        children: [
            {
                path: ':childEntityId/:parentEntityId',
                component: EntityLinkEditComponent,
                canActivate: [AccessGuard],
                canActivateChild: [AccessGuard],
                data: {
                    menu: 'admin',
                    submenu: 'entityLinks',
                    breadcrumb: 'Add Entity Link'
                }
            }
        ]
    },
    {
        path: 'entitypermissions',
        canActivate: [AccessGuard],
        canActivateChild: [AccessGuard],
        component: EntityPermissionListComponent,
        data: {
            menu: 'admin',
            submenu: 'entityPermissions',
            breadcrumb: 'Entity Permissions'
        }
    },
    {
        path: 'entitytypes',
        canActivate: [AccessGuard],
        canActivateChild: [AccessGuard],
        component: EntityTypeListComponent,
        data: {
            menu: 'admin',
            submenu: 'entityTypes',
            breadcrumb: 'Entity Types'
        },
        children: [
            {
                path: ':entityTypeId',
                component: EntityTypeEditComponent,
                canActivate: [AccessGuard],
                canActivateChild: [AccessGuard],
                data: {
                    menu: 'admin',
                    submenu: 'entityTypes',
                    breadcrumb: 'Add Entity Type'
                }
            }
        ]
    },
    {
        path: 'fields',
        canActivate: [AccessGuard],
        canActivateChild: [AccessGuard],
        component: FieldListComponent,
        data: {
            menu: 'admin',
            submenu: 'fields',
            breadcrumb: 'Fields'
        },
        children: [
            {
                path: ':fieldId',
                component: FieldEditComponent,
                canActivate: [AccessGuard],
                canActivateChild: [AccessGuard],
                data: {
                    menu: 'admin',
                    submenu: 'fields',
                    breadcrumb: 'Add Field'
                },
                children: [
                    {
                        path: 'options/:optionId',
                        component: OptionEditComponent,
                        canActivate: [AccessGuard],
                        canActivateChild: [AccessGuard],
                        data: {
                            menu: 'admin',
                            submenu: 'options',
                            breadcrumb: 'Add Option'
                        }
                    }
                ]
            }
        ]
    },
    {
        path: 'fieldvalues',
        canActivate: [AccessGuard],
        canActivateChild: [AccessGuard],
        component: FieldValueListComponent,
        data: {
            menu: 'admin',
            submenu: 'fieldValues',
            breadcrumb: 'Field Values'
        },
        children: [
            {
                path: ':itemId/:fieldId',
                component: FieldValueEditComponent,
                canActivate: [AccessGuard],
                canActivateChild: [AccessGuard],
                data: {
                    menu: 'admin',
                    submenu: 'fieldValues',
                    breadcrumb: 'Add Field Value'
                }
            }
        ]
    },
    {
        path: 'folders',
        canActivate: [AccessGuard],
        canActivateChild: [AccessGuard],
        component: FolderListComponent,
        data: {
            menu: 'admin',
            submenu: 'folders',
            breadcrumb: 'Folders'
        },
        children: [
            {
                path: ':folderId',
                component: FolderEditComponent,
                canActivate: [AccessGuard],
                canActivateChild: [AccessGuard],
                data: {
                    menu: '',
                    submenu: 'admin',
                    breadcrumb: 'Add Folder'
                },
                children: [
                    {
                        path: 'foldercontents/:folderContentId',
                        component: FolderContentEditComponent,
                        canActivate: [AccessGuard],
                        canActivateChild: [AccessGuard],
                        data: {
                            submenu: 'folderContents',
                            breadcrumb: 'Add Folder Content'
                        }
                    }
                ]
            }
        ]
    },
    {
        path: 'foldercontents',
        canActivate: [AccessGuard],
        canActivateChild: [AccessGuard],
        component: FolderContentListComponent,
        data: {
            submenu: 'folderContents',
            breadcrumb: 'Folder Contents'
        }
    },
    {
        path: 'groups',
        canActivate: [AccessGuard],
        canActivateChild: [AccessGuard],
        component: GroupListComponent,
        data: {
            menu: 'admin',
            submenu: 'groups',
            breadcrumb: 'Groups'
        },
        children: [
            {
                path: ':groupId',
                component: GroupEditComponent,
                canActivate: [AccessGuard],
                canActivateChild: [AccessGuard],
                data: {
                    menu: 'admin',
                    submenu: 'groups',
                    breadcrumb: 'Add Group'
                }
            }
        ]
    },
    {
        path: 'indicators',
        canActivate: [AccessGuard],
        canActivateChild: [AccessGuard],
        component: IndicatorListComponent,
        data: {
            menu: 'admin',
            submenu: 'indicators',
            breadcrumb: 'Indicators'
        },
        children: [
            {
                path: ':indicatorId',
                component: IndicatorEditComponent,
                canActivate: [AccessGuard],
                canActivateChild: [AccessGuard],
                data: {
                    menu: 'admin',
                    submenu: 'indicators',
                    breadcrumb: 'Add Indicator'
                }
            }
        ]
    },
    {
        path: 'indicatorpermissions',
        canActivate: [AccessGuard],
        canActivateChild: [AccessGuard],
        component: IndicatorPermissionListComponent,
        data: {
            menu: 'admin',
            submenu: 'indicatorPermissions',
            breadcrumb: 'Indicator Permissions'
        },
        children: [
            {
                path: ':indicatorPermissionId',
                component: IndicatorPermissionEditComponent,
                canActivate: [AccessGuard],
                canActivateChild: [AccessGuard],
                data: {
                    menu: 'admin',
                    submenu: 'indicatorPermissions',
                    breadcrumb: 'Add Indicator Permission'
                }
            }
        ]
    },
    {
        path: 'items',
        canActivate: [AccessGuard],
        canActivateChild: [AccessGuard],
        component: ItemListComponent,
        data: {
            menu: 'admin',
            submenu: 'items',
            breadcrumb: 'Items'
        },
        children: [
            {
                path: ':itemId',
                component: ItemEditComponent,
                canActivate: [AccessGuard],
                canActivateChild: [AccessGuard],
                data: {
                    menu: 'admin',
                    submenu: 'items',
                    breadcrumb: 'Add Item'
                },
                children: [
                    {
                        path: 'documents/:documentId',
                        component: DocumentEditComponent,
                        canActivate: [AccessGuard],
                        canActivateChild: [AccessGuard],
                        data: {
                            menu: 'admin',
                            submenu: 'documents',
                            breadcrumb: 'Add Document'
                        }
                    }
                ]
            }
        ]
    },
    {
        path: 'logframes',
        canActivate: [AccessGuard],
        canActivateChild: [AccessGuard],
        component: LogFrameListComponent,
        data: {
            menu: 'admin',
            submenu: 'logFrames',
            breadcrumb: 'Logical Frameworks'
        },
        children: [
            {
                path: ':logFrameId',
                component: LogFrameEditComponent,
                canActivate: [AccessGuard],
                canActivateChild: [AccessGuard],
                data: {
                    menu: 'admin',
                    submenu: 'logFrames',
                    breadcrumb: 'Add Logical Framework'
                },
                children: [
                    {
                        path: 'logframerows/:logFrameRowId',
                        component: LogFrameRowEditComponent,
                        canActivate: [AccessGuard],
                        canActivateChild: [AccessGuard],
                        data: {
                            menu: 'admin',
                            submenu: 'logFrameRows',
                            breadcrumb: 'Add LogFrame Row'
                        },
                        children: [
                            {
                                path: 'logframerowcomponents/:componentId',
                                component: LogFrameRowComponentEditComponent,
                                canActivate: [AccessGuard],
                                canActivateChild: [AccessGuard],
                                data: {
                                    menu: 'admin',
                                    submenu: 'logFrameRowComponents',
                                    breadcrumb: 'Add Log Frame Row Component'
                                }
                            },
                            {
                                path: 'logframerowindicators/:indicatorId',
                                component: LogFrameRowIndicatorEditComponent,
                                canActivate: [AccessGuard],
                                canActivateChild: [AccessGuard],
                                data: {
                                    menu: 'admin',
                                    submenu: 'logFrameRowIndicators',
                                    breadcrumb: 'Add Log Frame Row Indicator'
                                }
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        path: 'logframerows',
        canActivate: [AccessGuard],
        canActivateChild: [AccessGuard],
        component: LogFrameRowListComponent,
        data: {
            menu: 'admin',
            submenu: 'logFrameRows',
            breadcrumb: 'LogFrame Rows'
        }
    },
    {
        path: 'logframerowcomponents',
        canActivate: [AccessGuard],
        canActivateChild: [AccessGuard],
        component: LogFrameRowComponentListComponent,
        data: {
            menu: 'admin',
            submenu: 'logFrameRowComponents',
            breadcrumb: 'Log Frame Row Components'
        }
    },
    {
        path: 'logframerowindicators',
        canActivate: [AccessGuard],
        canActivateChild: [AccessGuard],
        component: LogFrameRowIndicatorListComponent,
        data: {
            menu: 'admin',
            submenu: 'logFrameRowIndicators',
            breadcrumb: 'Log Frame Row Indicators'
        }
    },
    {
        path: 'milestones',
        canActivate: [AccessGuard],
        canActivateChild: [AccessGuard],
        component: MilestoneListComponent,
        data: {
            menu: 'admin',
            submenu: 'milestones',
            breadcrumb: 'Milestones'
        }
    },
    {
        path: 'options',
        canActivate: [AccessGuard],
        canActivateChild: [AccessGuard],
        component: OptionListComponent,
        data: {
            menu: 'admin',
            submenu: 'options',
            breadcrumb: 'Options'
        }
    },
    {
        path: 'optionvalues',
        canActivate: [AccessGuard],
        canActivateChild: [AccessGuard],
        component: OptionValueListComponent,
        data: {
            menu: 'admin',
            submenu: 'optionValues',
            breadcrumb: 'Option Values'
        },
        children: [
            {
                path: ':itemId/:optionId',
                component: OptionValueEditComponent,
                canActivate: [AccessGuard],
                canActivateChild: [AccessGuard],
                data: {
                    menu: 'admin',
                    submenu: 'optionValues',
                    breadcrumb: 'Add Option Value'
                }
            }
        ]
    },
    {
        path: 'organisations',
        canActivate: [AccessGuard],
        canActivateChild: [AccessGuard],
        component: OrganisationListComponent,
        data: {
            menu: 'admin',
            submenu: 'organisations',
            breadcrumb: 'Organisations'
        },
        children: [
            {
                path: ':organisationId',
                component: OrganisationEditComponent,
                canActivate: [AccessGuard],
                canActivateChild: [AccessGuard],
                data: {
                    menu: 'admin',
                    submenu: 'organisations',
                    breadcrumb: 'Add Organisation'
                }
            }
        ]
    },
    {
        path: 'projects',
        canActivate: [AccessGuard],
        canActivateChild: [AccessGuard],
        component: ProjectListComponent,
        data: {
            menu: 'admin',
            submenu: 'projects',
            breadcrumb: 'Projects'
        },
        children: [
            {
                path: ':projectId',
                component: ProjectEditComponent,
                canActivate: [AccessGuard],
                canActivateChild: [AccessGuard],
                data: {
                    menu: 'admin',
                    submenu: 'projects',
                    breadcrumb: 'Add Project'
                },
                children: [
                    {
                        path: 'milestones/:milestoneId',
                        component: MilestoneEditComponent,
                        canActivate: [AccessGuard],
                        canActivateChild: [AccessGuard],
                        data: {
                            menu: 'admin',
                            submenu: 'milestones',
                            breadcrumb: 'Add Milestone'
                        },
                        children: [
                            {
                                path: 'tasks/:taskId',
                                component: TaskEditComponent,
                                canActivate: [AccessGuard],
                                canActivateChild: [AccessGuard],
                                data: {
                                    menu: 'admin',
                                    submenu: 'tasks',
                                    breadcrumb: 'Add Task'
                                }
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        path: 'questions',
        canActivate: [AccessGuard],
        canActivateChild: [AccessGuard],
        component: QuestionListComponent,
        data: {
            submenu: 'questions',
            breadcrumb: 'Questions'
        }
    },
    {
        path: 'questionnaires',
        canActivate: [AccessGuard],
        canActivateChild: [AccessGuard],
        component: QuestionnaireListComponent,
        data: {
            menu: 'admin',
            submenu: 'questionnaires',
            breadcrumb: 'Questionnaires'
        },
        children: [
            {
                path: ':questionnaireId',
                component: QuestionnaireEditComponent,
                canActivate: [AccessGuard],
                canActivateChild: [AccessGuard],
                data: {
                    menu: '',
                    submenu: 'questionnaires',
                    breadcrumb: 'Add Questionnaire'
                },
                children: [
                    {
                        path: 'responses/:responseId',
                        component: ResponseEditComponent,
                        canActivate: [AccessGuard],
                        canActivateChild: [AccessGuard],
                        data: {
                            submenu: 'responses',
                            breadcrumb: 'Add Response'
                        },
                        children: [
                            {
                                path: 'answers/:answerId',
                                component: AnswerEditComponent,
                                canActivate: [AccessGuard],
                                canActivateChild: [AccessGuard],
                                data: {
                                    submenu: 'answers',
                                    breadcrumb: 'Add Answer'
                                },
                                children: [
                                    {
                                        path: 'answeroptions/:questionOptionId',
                                        component: AnswerOptionEditComponent,
                                        canActivate: [AccessGuard],
                                        canActivateChild: [AccessGuard],
                                        data: {
                                            submenu: 'answerOptions',
                                            breadcrumb: 'Add Answer Option'
                                        }
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        path: 'sections/:sectionId',
                        component: SectionEditComponent,
                        canActivate: [AccessGuard],
                        canActivateChild: [AccessGuard],
                        data: {
                            submenu: 'sections',
                            breadcrumb: 'Add Section'
                        },
                        children: [
                            {
                                path: 'questions/:questionId',
                                component: QuestionEditComponent,
                                canActivate: [AccessGuard],
                                canActivateChild: [AccessGuard],
                                data: {
                                    submenu: 'questions',
                                    breadcrumb: 'Add Question'
                                },
                                children: [
                                    {
                                        path: 'questionsummaries/:dateId',
                                        component: QuestionSummaryEditComponent,
                                        canActivate: [AccessGuard],
                                        canActivateChild: [AccessGuard],
                                        data: {
                                            submenu: 'questionSummaries',
                                            breadcrumb: 'Add Question Summary'
                                        }
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        path: 'questionoptions',
        canActivate: [AccessGuard],
        canActivateChild: [AccessGuard],
        component: QuestionOptionListComponent,
        data: {
            submenu: 'questionOptions',
            breadcrumb: 'Options'
        }
    },
    {
        path: 'questionoptiongroups',
        canActivate: [AccessGuard],
        canActivateChild: [AccessGuard],
        component: QuestionOptionGroupListComponent,
        data: {
            submenu: 'questionOptionGroups',
            breadcrumb: 'Question Option Groups'
        },
        children: [
            {
                path: ':questionOptionGroupId',
                component: QuestionOptionGroupEditComponent,
                canActivate: [AccessGuard],
                canActivateChild: [AccessGuard],
                data: {
                    menu: '',
                    submenu: 'questionOptionGroups',
                    breadcrumb: 'Add Question Option Group'
                },
                children: [
                    {
                        path: 'questionoptions/:questionOptionId',
                        component: QuestionOptionEditComponent,
                        canActivate: [AccessGuard],
                        canActivateChild: [AccessGuard],
                        data: {
                            submenu: 'questionOptions',
                            breadcrumb: 'Add Option'
                        }
                    }
                ]
            }
        ]
    },
    {
        path: 'questionsummaries',
        canActivate: [AccessGuard],
        canActivateChild: [AccessGuard],
        component: QuestionSummaryListComponent,
        data: {
            submenu: 'questionSummaries',
            breadcrumb: 'Question Summaries'
        }
    },
    {
        path: 'relationships',
        canActivate: [AccessGuard],
        canActivateChild: [AccessGuard],
        component: RelationshipListComponent,
        data: {
            menu: 'admin',
            submenu: 'relationships',
            breadcrumb: 'Relationships'
        }
    },
    {
        path: 'responses',
        canActivate: [AccessGuard],
        canActivateChild: [AccessGuard],
        component: ResponseListComponent,
        data: {
            submenu: 'responses',
            breadcrumb: 'Responses'
        }
    },
    {
        path: 'sections',
        canActivate: [AccessGuard],
        canActivateChild: [AccessGuard],
        component: SectionListComponent,
        data: {
            submenu: 'sections',
            breadcrumb: 'Sections'
        }
    },
    {
        path: 'settings',
        canActivate: [AccessGuard],
        canActivateChild: [AccessGuard],
        component: SettingsEditComponent,
        data: {
            menu: 'admin',
            submenu: 'settings',
            breadcrumb: 'Settings'
        },
    },
    {
        path: 'skiplogicoptions',
        canActivate: [AccessGuard],
        canActivateChild: [AccessGuard],
        component: SkipLogicOptionListComponent,
        data: {
            submenu: 'skipLogicOptions',
            breadcrumb: 'Skip Logic Options'
        },
        children: [
            {
                path: ':questionId/:checkQuestionOptionId',
                component: SkipLogicOptionEditComponent,
                canActivate: [AccessGuard],
                canActivateChild: [AccessGuard],
                data: {
                    menu: '',
                    submenu: 'skipLogicOptions',
                    breadcrumb: 'Add Skip Logic Option'
                }
            }
        ]
    },
    {
        path: 'subcategories',
        canActivate: [AccessGuard],
        canActivateChild: [AccessGuard],
        component: SubcategoryListComponent,
        data: {
            menu: 'admin',
            submenu: 'subcategories',
            breadcrumb: 'Subcategories'
        }
    },
    {
        path: 'tasks',
        canActivate: [AccessGuard],
        canActivateChild: [AccessGuard],
        component: TaskListComponent,
        data: {
            menu: 'admin',
            submenu: 'tasks',
            breadcrumb: 'Tasks'
        }
    },
    {
        path: 'theoriesofchange',
        canActivate: [AccessGuard],
        canActivateChild: [AccessGuard],
        component: TheoryOfChangeListComponent,
        data: {
            menu: 'admin',
            submenu: 'theoriesOfChange',
            breadcrumb: 'Theories of Change'
        },
        children: [
            {
                path: ':theoryOfChangeId',
                component: TheoryOfChangeEditComponent,
                canActivate: [AccessGuard],
                canActivateChild: [AccessGuard],
                data: {
                    menu: 'admin',
                    submenu: 'theoriesOfChange',
                    breadcrumb: 'Add Theory of Change'
                },
                children: [
                    {
                        path: 'relationships/:relationshipId',
                        component: RelationshipEditComponent,
                        canActivate: [AccessGuard],
                        canActivateChild: [AccessGuard],
                        data: {
                            menu: 'admin',
                            submenu: 'relationships',
                            breadcrumb: 'Add Relationship'
                        }
                    },
                    {
                        path: 'theoryofchangecomponents/:componentId',
                        component: TheoryOfChangeComponentEditComponent,
                        canActivate: [AccessGuard],
                        canActivateChild: [AccessGuard],
                        data: {
                            menu: 'admin',
                            submenu: 'theoryOfChangeComponents',
                            breadcrumb: 'Add Theory of Change Component'
                        }
                    }
                ]
            }
        ]
    },
    {
        path: 'theoryofchangecomponents',
        canActivate: [AccessGuard],
        canActivateChild: [AccessGuard],
        component: TheoryOfChangeComponentListComponent,
        data: {
            menu: 'admin',
            submenu: 'theoryOfChangeComponents',
            breadcrumb: 'Theory of Change Components'
        }
    },
    {
        path: 'tokens',
        canActivate: [AccessGuard],
        canActivateChild: [AccessGuard],
        component: TokenListComponent,
        data: {
            menu: 'admin',
            submenu: 'tokens',
            breadcrumb: 'Tokens'
        },
        children: [
            {
                path: ':indicatorId/:tokenNumber',
                component: TokenEditComponent,
                canActivate: [AccessGuard],
                canActivateChild: [AccessGuard],
                data: {
                    menu: 'admin',
                    submenu: 'tokens',
                    breadcrumb: 'Add Token'
                }
            }
        ]
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
                },
                children: [
                    {
                        path: 'entitypermissions/:entityPermissionId',
                        component: EntityPermissionEditComponent,
                        canActivate: [AccessGuard],
                        canActivateChild: [AccessGuard],
                        data: {
                            menu: 'admin',
                            submenu: 'entityPermissions',
                            breadcrumb: 'Add Entity Permission'
                        }
                    }
                ]
            }
        ]
    }
];
