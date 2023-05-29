export class Enum {
    value: number;
    name: string;
    label: string;
}

export enum AggregationTypes {
    Sum,
    MostRecent
}

export enum Associativenesses {
    Left,
    Right
}

export enum ComponentTypes {
    Input,
    Activity,
    Output,
    Outcome,
    Impact
}

export enum DataTypes {
    Currency,
    Number,
    Percent
}

export enum DateTypes {
    Year,
    Quarter,
    Month
}

export enum FieldTypes {
    Text,
    Date,
    Picklist,
    File,
    YesNo
}

export enum IndicatorStatuses {
    Disabled,
    Enabled
}

export enum IndicatorTypes {
    Collected,
    Calculated
}

export enum ItemTypes {
    Entity,
    Indicator,
    Organisation,
    Component,
    Relationship,
    Answer,
    Folder
}

export enum LogFrameRowTypes {
    Activities,
    Outputs,
    Outcomes,
    Goals
}

export enum OperatorTypes {
    Add,
    Subtract,
    Multiply,
    Divide
}

export enum OptionListTypes {
    Rating = 0,
    Dropdown = 1,
    RadioList = 2,
    Checkboxes = 3
}

export enum ParenthesisTypes {
    Open,
    Close
}

export enum PermissionTypes {
    View,
    Edit,
    Submit,
    Verify,
    Approve
}

export enum QuestionTypes {
    Text,
    OptionList,
    Multiline,
    Note,
    Document
}

export enum ReviewResults {
    Rejected,
    Accepted
}

export enum ReviewStatuses {
    Submit,
    Verify,
    Approve
}

export enum Roles {
    Administrator,
    Manager,
    Oversight,
    Questionnaires,
    Folders,
    DataEntry
}

export enum Sizes {
    Small,
    Medium,
    Large,
    ExtraLarge,
    Full
}

export enum SkipLogicActions {
    Hide,
    Show
}

export enum TokenTypes {
    Indicator,
    Number,
    Operator,
    Parenthesis
}

export enum WidgetSizes {
    ExtraSmall,
    Small,
    Medium,
    Large,
    ExtraLarge,
    Maximum
}

export enum WidgetTypes {
    IndicatorMap,
    IndicatorLineChart,
    IndicatorBarChart,
    IndicatorPieChart,
    QuestionnaireBarChart,
    FolderShortcut
}

export class Enums {

     static AggregationTypes: Enum[] = [
        { value: 0, name: 'Sum', label: 'Sum' },
        { value: 1, name: 'MostRecent', label: 'Most Recent' }
     ]

     static Associativenesses: Enum[] = [
        { value: 0, name: 'Left', label: 'Left' },
        { value: 1, name: 'Right', label: 'Right' }
     ]

     static ComponentTypes: Enum[] = [
        { value: 0, name: 'Input', label: 'Input' },
        { value: 1, name: 'Activity', label: 'Activity' },
        { value: 2, name: 'Output', label: 'Output' },
        { value: 3, name: 'Outcome', label: 'Outcome' },
        { value: 4, name: 'Impact', label: 'Impact' }
     ]

     static DataTypes: Enum[] = [
        { value: 0, name: 'Currency', label: 'Currency' },
        { value: 1, name: 'Number', label: 'Number' },
        { value: 2, name: 'Percent', label: 'Percent' }
     ]

     static DateTypes: Enum[] = [
        { value: 0, name: 'Year', label: 'Year' },
        { value: 1, name: 'Quarter', label: 'Quarter' },
        { value: 2, name: 'Month', label: 'Month' }
     ]

     static FieldTypes: Enum[] = [
        { value: 0, name: 'Text', label: 'Text' },
        { value: 1, name: 'Date', label: 'Date' },
        { value: 2, name: 'Picklist', label: 'Picklist' },
        { value: 3, name: 'File', label: 'File' },
        { value: 4, name: 'YesNo', label: 'Yes/No' }
     ]

     static IndicatorStatuses: Enum[] = [
        { value: 0, name: 'Disabled', label: 'Disabled' },
        { value: 1, name: 'Enabled', label: 'Enabled' }
     ]

     static IndicatorTypes: Enum[] = [
        { value: 0, name: 'Collected', label: 'Collected' },
        { value: 1, name: 'Calculated', label: 'Calculated' }
     ]

     static ItemTypes: Enum[] = [
        { value: 0, name: 'Entity', label: 'Entity' },
        { value: 1, name: 'Indicator', label: 'Indicator' },
        { value: 2, name: 'Organisation', label: 'Organisation' },
        { value: 3, name: 'Component', label: 'Component' },
        { value: 4, name: 'Relationship', label: 'Relationship' },
        { value: 5, name: 'Answer', label: 'Answer' },
        { value: 6, name: 'Folder', label: 'Folder' }
     ]

     static LogFrameRowTypes: Enum[] = [
        { value: 0, name: 'Activities', label: 'Activities' },
        { value: 1, name: 'Outputs', label: 'Outputs' },
        { value: 2, name: 'Outcomes', label: 'Outcomes' },
        { value: 3, name: 'Goals', label: 'Goals' }
     ]

     static OperatorTypes: Enum[] = [
        { value: 0, name: 'Add', label: 'Add' },
        { value: 1, name: 'Subtract', label: 'Subtract' },
        { value: 2, name: 'Multiply', label: 'Multiply' },
        { value: 3, name: 'Divide', label: 'Divide' }
     ]

     static OptionListTypes: Enum[] = [
        { value: 0, name: 'Rating', label: 'Rating (single, horizontal, radio)' },
        { value: 1, name: 'Dropdown', label: 'Dropdown (single)' },
        { value: 2, name: 'RadioList', label: 'Radio List (single, vertical, radio)' },
        { value: 3, name: 'Checkboxes', label: 'Checkboxes (multiple, vertical)' }
     ]

     static ParenthesisTypes: Enum[] = [
        { value: 0, name: 'Open', label: 'Open' },
        { value: 1, name: 'Close', label: 'Close' }
     ]

     static PermissionTypes: Enum[] = [
        { value: 0, name: 'View', label: 'View' },
        { value: 1, name: 'Edit', label: 'Edit' },
        { value: 2, name: 'Submit', label: 'Submit' },
        { value: 3, name: 'Verify', label: 'Verify' },
        { value: 4, name: 'Approve', label: 'Approve' }
     ]

     static QuestionTypes: Enum[] = [
        { value: 0, name: 'Text', label: 'Text' },
        { value: 1, name: 'OptionList', label: 'Option List' },
        { value: 2, name: 'Multiline', label: 'Multi-line Text' },
        { value: 3, name: 'Note', label: 'Note' },
        { value: 4, name: 'Document', label: 'Document' }
     ]

     static ReviewResults: Enum[] = [
        { value: 0, name: 'Rejected', label: 'Rejected' },
        { value: 1, name: 'Accepted', label: 'Accepted' }
     ]

     static ReviewStatuses: Enum[] = [
        { value: 0, name: 'Submit', label: 'Submit' },
        { value: 1, name: 'Verify', label: 'Verify' },
        { value: 2, name: 'Approve', label: 'Approve' }
     ]

     static Roles: Enum[] = [
        { value: 0, name: 'Administrator', label: 'Administrator' },
        { value: 1, name: 'Manager', label: 'Manager' },
        { value: 2, name: 'Oversight', label: 'Oversight' },
        { value: 3, name: 'Questionnaires', label: 'Questionnaires' },
        { value: 4, name: 'Folders', label: 'Folders' },
        { value: 5, name: 'DataEntry', label: 'Data Entry' }
     ]

     static Sizes: Enum[] = [
        { value: 0, name: 'Small', label: 'Small' },
        { value: 1, name: 'Medium', label: 'Medium' },
        { value: 2, name: 'Large', label: 'Large' },
        { value: 3, name: 'ExtraLarge', label: 'Extra-Large' },
        { value: 4, name: 'Full', label: 'Full Width' }
     ]

     static SkipLogicActions: Enum[] = [
        { value: 0, name: 'Hide', label: 'Hide' },
        { value: 1, name: 'Show', label: 'Show' }
     ]

     static TokenTypes: Enum[] = [
        { value: 0, name: 'Indicator', label: 'Indicator' },
        { value: 1, name: 'Number', label: 'Number' },
        { value: 2, name: 'Operator', label: 'Operator' },
        { value: 3, name: 'Parenthesis', label: 'Parenthesis' }
     ]

     static WidgetSizes: Enum[] = [
        { value: 0, name: 'ExtraSmall', label: 'Extra Small' },
        { value: 1, name: 'Small', label: 'Small' },
        { value: 2, name: 'Medium', label: 'Medium' },
        { value: 3, name: 'Large', label: 'Large' },
        { value: 4, name: 'ExtraLarge', label: 'Extra Large' },
        { value: 5, name: 'Maximum', label: 'Maximum' }
     ]

     static WidgetTypes: Enum[] = [
        { value: 0, name: 'IndicatorMap', label: 'Indicator - Map' },
        { value: 1, name: 'IndicatorLineChart', label: 'Indicator - Line Chart' },
        { value: 2, name: 'IndicatorBarChart', label: 'Indicator - Bar Chart' },
        { value: 3, name: 'IndicatorPieChart', label: 'Indicator - Pie Chart' },
        { value: 4, name: 'QuestionnaireBarChart', label: 'Questionnaire - Bar Chart' },
        { value: 5, name: 'FolderShortcut', label: 'Folder - Shortcut' }
     ]

}
