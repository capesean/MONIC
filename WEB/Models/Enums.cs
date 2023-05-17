namespace WEB.Models
{
    public enum AggregationType
    {
        Sum,
        MostRecent
    }

    public enum Associativeness
    {
        Left,
        Right
    }

    public enum ComponentType
    {
        Input,
        Activity,
        Output,
        Outcome,
        Impact
    }

    public enum DataType
    {
        Currency,
        Number,
        Percent
    }

    public enum DateType
    {
        Year,
        Quarter,
        Month
    }

    public enum FieldType
    {
        Text,
        Date,
        Picklist,
        File,
        YesNo
    }

    public enum IndicatorStatus
    {
        Disabled,
        Enabled
    }

    public enum IndicatorType
    {
        Collected,
        Calculated
    }

    public enum ItemType
    {
        Entity,
        Indicator,
        Organisation,
        Component,
        Relationship,
        Answer,
        Folder
    }

    public enum LogFrameRowType
    {
        Activities,
        Outputs,
        Outcomes,
        Goals
    }

    public enum OperatorType
    {
        Add,
        Subtract,
        Multiply,
        Divide
    }

    public enum OptionListType
    {
        Rating = 0,
        Dropdown = 1,
        RadioList = 2,
        Checkboxes = 3
    }

    public enum ParenthesisType
    {
        Open,
        Close
    }

    public enum PermissionType
    {
        View,
        Edit,
        Submit,
        Verify,
        Approve
    }

    public enum QuestionType
    {
        Text,
        OptionList,
        Multiline,
        Note,
        Document
    }

    public enum ReviewResult
    {
        Rejected,
        Accepted
    }

    public enum ReviewStatus
    {
        Submit,
        Verify,
        Approve
    }

    public enum Size
    {
        Small,
        Medium,
        Large,
        ExtraLarge,
        Full
    }

    public enum SkipLogicAction
    {
        Hide,
        Show
    }

    public enum TokenType
    {
        Indicator,
        Number,
        Operator,
        Parenthesis
    }

    public enum WidgetSize
    {
        ExtraSmall,
        Small,
        Medium,
        Large,
        ExtraLarge,
        Maximum
    }

    public enum WidgetType
    {
        IndicatorMap,
        IndicatorLineChart,
        IndicatorBarChart,
        IndicatorPieChart,
        QuestionnaireBarChart,
        FolderShortcut
    }

    public static class Extensions
    {
        public static string Label(this AggregationType aggregationType)
        {
            switch (aggregationType)
            {
                case AggregationType.Sum:
                    return "Sum";
                case AggregationType.MostRecent:
                    return "Most Recent";
                default:
                    return null;
            }
        }

        public static string Label(this Associativeness associativeness)
        {
            switch (associativeness)
            {
                case Associativeness.Left:
                    return "Left";
                case Associativeness.Right:
                    return "Right";
                default:
                    return null;
            }
        }

        public static string Label(this ComponentType componentType)
        {
            switch (componentType)
            {
                case ComponentType.Input:
                    return "Input";
                case ComponentType.Activity:
                    return "Activity";
                case ComponentType.Output:
                    return "Output";
                case ComponentType.Outcome:
                    return "Outcome";
                case ComponentType.Impact:
                    return "Impact";
                default:
                    return null;
            }
        }

        public static string Label(this DataType dataType)
        {
            switch (dataType)
            {
                case DataType.Currency:
                    return "Currency";
                case DataType.Number:
                    return "Number";
                case DataType.Percent:
                    return "Percent";
                default:
                    return null;
            }
        }

        public static string Label(this DateType dateType)
        {
            switch (dateType)
            {
                case DateType.Year:
                    return "Year";
                case DateType.Quarter:
                    return "Quarter";
                case DateType.Month:
                    return "Month";
                default:
                    return null;
            }
        }

        public static string Label(this FieldType fieldType)
        {
            switch (fieldType)
            {
                case FieldType.Text:
                    return "Text";
                case FieldType.Date:
                    return "Date";
                case FieldType.Picklist:
                    return "Picklist";
                case FieldType.File:
                    return "File";
                case FieldType.YesNo:
                    return "Yes/No";
                default:
                    return null;
            }
        }

        public static string Label(this IndicatorStatus indicatorStatus)
        {
            switch (indicatorStatus)
            {
                case IndicatorStatus.Disabled:
                    return "Disabled";
                case IndicatorStatus.Enabled:
                    return "Enabled";
                default:
                    return null;
            }
        }

        public static string Label(this IndicatorType indicatorType)
        {
            switch (indicatorType)
            {
                case IndicatorType.Collected:
                    return "Collected";
                case IndicatorType.Calculated:
                    return "Calculated";
                default:
                    return null;
            }
        }

        public static string Label(this ItemType itemType)
        {
            switch (itemType)
            {
                case ItemType.Entity:
                    return "Entity";
                case ItemType.Indicator:
                    return "Indicator";
                case ItemType.Organisation:
                    return "Organisation";
                case ItemType.Component:
                    return "Component";
                case ItemType.Relationship:
                    return "Relationship";
                case ItemType.Answer:
                    return "Answer";
                case ItemType.Folder:
                    return "Folder";
                default:
                    return null;
            }
        }

        public static string Label(this LogFrameRowType logFrameRowType)
        {
            switch (logFrameRowType)
            {
                case LogFrameRowType.Activities:
                    return "Activities";
                case LogFrameRowType.Outputs:
                    return "Outputs";
                case LogFrameRowType.Outcomes:
                    return "Outcomes";
                case LogFrameRowType.Goals:
                    return "Goals";
                default:
                    return null;
            }
        }

        public static string Label(this OperatorType operatorType)
        {
            switch (operatorType)
            {
                case OperatorType.Add:
                    return "Add";
                case OperatorType.Subtract:
                    return "Subtract";
                case OperatorType.Multiply:
                    return "Multiply";
                case OperatorType.Divide:
                    return "Divide";
                default:
                    return null;
            }
        }

        public static string Label(this OptionListType optionListType)
        {
            switch (optionListType)
            {
                case OptionListType.Rating:
                    return "Rating (single, horizontal, radio)";
                case OptionListType.Dropdown:
                    return "Dropdown (single)";
                case OptionListType.RadioList:
                    return "Radio List (multiple, vertical, radio)";
                case OptionListType.Checkboxes:
                    return "Checkboxes (multiple, vertical)";
                default:
                    return null;
            }
        }

        public static string Label(this ParenthesisType parenthesisType)
        {
            switch (parenthesisType)
            {
                case ParenthesisType.Open:
                    return "Open";
                case ParenthesisType.Close:
                    return "Close";
                default:
                    return null;
            }
        }

        public static string Label(this PermissionType permissionType)
        {
            switch (permissionType)
            {
                case PermissionType.View:
                    return "View";
                case PermissionType.Edit:
                    return "Edit";
                case PermissionType.Submit:
                    return "Submit";
                case PermissionType.Verify:
                    return "Verify";
                case PermissionType.Approve:
                    return "Approve";
                default:
                    return null;
            }
        }

        public static string Label(this QuestionType questionType)
        {
            switch (questionType)
            {
                case QuestionType.Text:
                    return "Text";
                case QuestionType.OptionList:
                    return "Option List";
                case QuestionType.Multiline:
                    return "Multi-line Text";
                case QuestionType.Note:
                    return "Note";
                case QuestionType.Document:
                    return "Document";
                default:
                    return null;
            }
        }

        public static string Label(this ReviewResult reviewResult)
        {
            switch (reviewResult)
            {
                case ReviewResult.Rejected:
                    return "Rejected";
                case ReviewResult.Accepted:
                    return "Accepted";
                default:
                    return null;
            }
        }

        public static string Label(this ReviewStatus reviewStatus)
        {
            switch (reviewStatus)
            {
                case ReviewStatus.Submit:
                    return "Submit";
                case ReviewStatus.Verify:
                    return "Verify";
                case ReviewStatus.Approve:
                    return "Approve";
                default:
                    return null;
            }
        }

        public static string Label(this Size size)
        {
            switch (size)
            {
                case Size.Small:
                    return "Small";
                case Size.Medium:
                    return "Medium";
                case Size.Large:
                    return "Large";
                case Size.ExtraLarge:
                    return "Extra-Large";
                case Size.Full:
                    return "Full Width";
                default:
                    return null;
            }
        }

        public static string Label(this SkipLogicAction skipLogicAction)
        {
            switch (skipLogicAction)
            {
                case SkipLogicAction.Hide:
                    return "Hide";
                case SkipLogicAction.Show:
                    return "Show";
                default:
                    return null;
            }
        }

        public static string Label(this TokenType tokenType)
        {
            switch (tokenType)
            {
                case TokenType.Indicator:
                    return "Indicator";
                case TokenType.Number:
                    return "Number";
                case TokenType.Operator:
                    return "Operator";
                case TokenType.Parenthesis:
                    return "Parenthesis";
                default:
                    return null;
            }
        }

        public static string Label(this WidgetSize widgetSize)
        {
            switch (widgetSize)
            {
                case WidgetSize.ExtraSmall:
                    return "Extra Small";
                case WidgetSize.Small:
                    return "Small";
                case WidgetSize.Medium:
                    return "Medium";
                case WidgetSize.Large:
                    return "Large";
                case WidgetSize.ExtraLarge:
                    return "Extra Large";
                case WidgetSize.Maximum:
                    return "Maximum";
                default:
                    return null;
            }
        }

        public static string Label(this WidgetType widgetType)
        {
            switch (widgetType)
            {
                case WidgetType.IndicatorMap:
                    return "Indicator - Map";
                case WidgetType.IndicatorLineChart:
                    return "Indicator - Line Chart";
                case WidgetType.IndicatorBarChart:
                    return "Indicator - Bar Chart";
                case WidgetType.IndicatorPieChart:
                    return "Indicator - Pie Chart";
                case WidgetType.QuestionnaireBarChart:
                    return "Questionnaire - Bar Chart";
                case WidgetType.FolderShortcut:
                    return "Folder - Shortcut";
                default:
                    return null;
            }
        }

    }
}
