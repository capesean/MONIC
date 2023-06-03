export class Enum {
}
export var AggregationTypes;
(function (AggregationTypes) {
    AggregationTypes[AggregationTypes["Sum"] = 0] = "Sum";
    AggregationTypes[AggregationTypes["MostRecent"] = 1] = "MostRecent";
})(AggregationTypes || (AggregationTypes = {}));
export var Associativenesses;
(function (Associativenesses) {
    Associativenesses[Associativenesses["Left"] = 0] = "Left";
    Associativenesses[Associativenesses["Right"] = 1] = "Right";
})(Associativenesses || (Associativenesses = {}));
export var ComponentTypes;
(function (ComponentTypes) {
    ComponentTypes[ComponentTypes["Input"] = 0] = "Input";
    ComponentTypes[ComponentTypes["Activity"] = 1] = "Activity";
    ComponentTypes[ComponentTypes["Output"] = 2] = "Output";
    ComponentTypes[ComponentTypes["Outcome"] = 3] = "Outcome";
    ComponentTypes[ComponentTypes["Impact"] = 4] = "Impact";
})(ComponentTypes || (ComponentTypes = {}));
export var DataTypes;
(function (DataTypes) {
    DataTypes[DataTypes["Currency"] = 0] = "Currency";
    DataTypes[DataTypes["Number"] = 1] = "Number";
    DataTypes[DataTypes["Percent"] = 2] = "Percent";
})(DataTypes || (DataTypes = {}));
export var DateTypes;
(function (DateTypes) {
    DateTypes[DateTypes["Year"] = 0] = "Year";
    DateTypes[DateTypes["Quarter"] = 1] = "Quarter";
    DateTypes[DateTypes["Month"] = 2] = "Month";
})(DateTypes || (DateTypes = {}));
export var FieldTypes;
(function (FieldTypes) {
    FieldTypes[FieldTypes["Text"] = 0] = "Text";
    FieldTypes[FieldTypes["Date"] = 1] = "Date";
    FieldTypes[FieldTypes["Picklist"] = 2] = "Picklist";
    FieldTypes[FieldTypes["File"] = 3] = "File";
    FieldTypes[FieldTypes["YesNo"] = 4] = "YesNo";
})(FieldTypes || (FieldTypes = {}));
export var IndicatorStatuses;
(function (IndicatorStatuses) {
    IndicatorStatuses[IndicatorStatuses["Disabled"] = 0] = "Disabled";
    IndicatorStatuses[IndicatorStatuses["Enabled"] = 1] = "Enabled";
})(IndicatorStatuses || (IndicatorStatuses = {}));
export var IndicatorTypes;
(function (IndicatorTypes) {
    IndicatorTypes[IndicatorTypes["Collected"] = 0] = "Collected";
    IndicatorTypes[IndicatorTypes["Calculated"] = 1] = "Calculated";
})(IndicatorTypes || (IndicatorTypes = {}));
export var ItemTypes;
(function (ItemTypes) {
    ItemTypes[ItemTypes["Entity"] = 0] = "Entity";
    ItemTypes[ItemTypes["Indicator"] = 1] = "Indicator";
    ItemTypes[ItemTypes["Organisation"] = 2] = "Organisation";
    ItemTypes[ItemTypes["Component"] = 3] = "Component";
    ItemTypes[ItemTypes["Relationship"] = 4] = "Relationship";
})(ItemTypes || (ItemTypes = {}));
export var LogFrameRowTypes;
(function (LogFrameRowTypes) {
    LogFrameRowTypes[LogFrameRowTypes["Activities"] = 0] = "Activities";
    LogFrameRowTypes[LogFrameRowTypes["Outputs"] = 1] = "Outputs";
    LogFrameRowTypes[LogFrameRowTypes["Outcomes"] = 2] = "Outcomes";
    LogFrameRowTypes[LogFrameRowTypes["Goals"] = 3] = "Goals";
})(LogFrameRowTypes || (LogFrameRowTypes = {}));
export var OperatorTypes;
(function (OperatorTypes) {
    OperatorTypes[OperatorTypes["Add"] = 0] = "Add";
    OperatorTypes[OperatorTypes["Subtract"] = 1] = "Subtract";
    OperatorTypes[OperatorTypes["Multiply"] = 2] = "Multiply";
    OperatorTypes[OperatorTypes["Divide"] = 3] = "Divide";
})(OperatorTypes || (OperatorTypes = {}));
export var ParenthesisTypes;
(function (ParenthesisTypes) {
    ParenthesisTypes[ParenthesisTypes["Open"] = 0] = "Open";
    ParenthesisTypes[ParenthesisTypes["Close"] = 1] = "Close";
})(ParenthesisTypes || (ParenthesisTypes = {}));
export var PermissionTypes;
(function (PermissionTypes) {
    PermissionTypes[PermissionTypes["View"] = 0] = "View";
    PermissionTypes[PermissionTypes["Edit"] = 1] = "Edit";
    PermissionTypes[PermissionTypes["Submit"] = 2] = "Submit";
    PermissionTypes[PermissionTypes["Verify"] = 3] = "Verify";
    PermissionTypes[PermissionTypes["Approve"] = 4] = "Approve";
})(PermissionTypes || (PermissionTypes = {}));
export var ReviewResults;
(function (ReviewResults) {
    ReviewResults[ReviewResults["Rejected"] = 0] = "Rejected";
    ReviewResults[ReviewResults["Accepted"] = 1] = "Accepted";
})(ReviewResults || (ReviewResults = {}));
export var ReviewStatuses;
(function (ReviewStatuses) {
    ReviewStatuses[ReviewStatuses["Submit"] = 0] = "Submit";
    ReviewStatuses[ReviewStatuses["Verify"] = 1] = "Verify";
    ReviewStatuses[ReviewStatuses["Approve"] = 2] = "Approve";
})(ReviewStatuses || (ReviewStatuses = {}));
export var Roles;
(function (Roles) {
    Roles[Roles["Administrator"] = 0] = "Administrator";
    Roles[Roles["Manager"] = 1] = "Manager";
    Roles[Roles["Oversight"] = 2] = "Oversight";
})(Roles || (Roles = {}));
export var Sizes;
(function (Sizes) {
    Sizes[Sizes["Small"] = 0] = "Small";
    Sizes[Sizes["Medium"] = 1] = "Medium";
    Sizes[Sizes["Large"] = 2] = "Large";
    Sizes[Sizes["ExtraLarge"] = 3] = "ExtraLarge";
    Sizes[Sizes["Full"] = 4] = "Full";
})(Sizes || (Sizes = {}));
export var TokenTypes;
(function (TokenTypes) {
    TokenTypes[TokenTypes["Indicator"] = 0] = "Indicator";
    TokenTypes[TokenTypes["Number"] = 1] = "Number";
    TokenTypes[TokenTypes["Operator"] = 2] = "Operator";
    TokenTypes[TokenTypes["Parenthesis"] = 3] = "Parenthesis";
})(TokenTypes || (TokenTypes = {}));
export var WidgetSizes;
(function (WidgetSizes) {
    WidgetSizes[WidgetSizes["ExtraSmall"] = 0] = "ExtraSmall";
    WidgetSizes[WidgetSizes["Small"] = 1] = "Small";
    WidgetSizes[WidgetSizes["Medium"] = 2] = "Medium";
    WidgetSizes[WidgetSizes["Large"] = 3] = "Large";
    WidgetSizes[WidgetSizes["ExtraLarge"] = 4] = "ExtraLarge";
    WidgetSizes[WidgetSizes["Maximum"] = 5] = "Maximum";
})(WidgetSizes || (WidgetSizes = {}));
export class Enums {
}
Enums.AggregationTypes = [
    { value: 0, name: 'Sum', label: 'Sum' },
    { value: 1, name: 'MostRecent', label: 'Most Recent' }
];
Enums.Associativenesses = [
    { value: 0, name: 'Left', label: 'Left' },
    { value: 1, name: 'Right', label: 'Right' }
];
Enums.ComponentTypes = [
    { value: 0, name: 'Input', label: 'Input' },
    { value: 1, name: 'Activity', label: 'Activity' },
    { value: 2, name: 'Output', label: 'Output' },
    { value: 3, name: 'Outcome', label: 'Outcome' },
    { value: 4, name: 'Impact', label: 'Impact' }
];
Enums.DataTypes = [
    { value: 0, name: 'Currency', label: 'Currency' },
    { value: 1, name: 'Number', label: 'Number' },
    { value: 2, name: 'Percent', label: 'Percent' }
];
Enums.DateTypes = [
    { value: 0, name: 'Year', label: 'Year' },
    { value: 1, name: 'Quarter', label: 'Quarter' },
    { value: 2, name: 'Month', label: 'Month' }
];
Enums.FieldTypes = [
    { value: 0, name: 'Text', label: 'Text' },
    { value: 1, name: 'Date', label: 'Date' },
    { value: 2, name: 'Picklist', label: 'Picklist' },
    { value: 3, name: 'File', label: 'File' },
    { value: 4, name: 'YesNo', label: 'Yes/No' }
];
Enums.IndicatorStatuses = [
    { value: 0, name: 'Disabled', label: 'Disabled' },
    { value: 1, name: 'Enabled', label: 'Enabled' }
];
Enums.IndicatorTypes = [
    { value: 0, name: 'Collected', label: 'Collected' },
    { value: 1, name: 'Calculated', label: 'Calculated' }
];
Enums.ItemTypes = [
    { value: 0, name: 'Entity', label: 'Entity' },
    { value: 1, name: 'Indicator', label: 'Indicator' },
    { value: 2, name: 'Organisation', label: 'Organisation' },
    { value: 3, name: 'Component', label: 'Component' },
    { value: 4, name: 'Relationship', label: 'Relationship' }
];
Enums.LogFrameRowTypes = [
    { value: 0, name: 'Activities', label: 'Activities' },
    { value: 1, name: 'Outputs', label: 'Outputs' },
    { value: 2, name: 'Outcomes', label: 'Outcomes' },
    { value: 3, name: 'Goals', label: 'Goals' }
];
Enums.OperatorTypes = [
    { value: 0, name: 'Add', label: 'Add' },
    { value: 1, name: 'Subtract', label: 'Subtract' },
    { value: 2, name: 'Multiply', label: 'Multiply' },
    { value: 3, name: 'Divide', label: 'Divide' }
];
Enums.ParenthesisTypes = [
    { value: 0, name: 'Open', label: 'Open' },
    { value: 1, name: 'Close', label: 'Close' }
];
Enums.PermissionTypes = [
    { value: 0, name: 'View', label: 'View' },
    { value: 1, name: 'Edit', label: 'Edit' },
    { value: 2, name: 'Submit', label: 'Submit' },
    { value: 3, name: 'Verify', label: 'Verify' },
    { value: 4, name: 'Approve', label: 'Approve' }
];
Enums.ReviewResults = [
    { value: 0, name: 'Rejected', label: 'Rejected' },
    { value: 1, name: 'Accepted', label: 'Accepted' }
];
Enums.ReviewStatuses = [
    { value: 0, name: 'Submit', label: 'Submit' },
    { value: 1, name: 'Verify', label: 'Verify' },
    { value: 2, name: 'Approve', label: 'Approve' }
];
Enums.Roles = [
    { value: 0, name: 'Administrator', label: 'Administrator' },
    { value: 1, name: 'Manager', label: 'Manager' },
    { value: 2, name: 'Oversight', label: 'Oversight' }
];
Enums.Sizes = [
    { value: 0, name: 'Small', label: 'Small' },
    { value: 1, name: 'Medium', label: 'Medium' },
    { value: 2, name: 'Large', label: 'Large' },
    { value: 3, name: 'ExtraLarge', label: 'Extra-Large' },
    { value: 4, name: 'Full', label: 'Full Width' }
];
Enums.TokenTypes = [
    { value: 0, name: 'Indicator', label: 'Indicator' },
    { value: 1, name: 'Number', label: 'Number' },
    { value: 2, name: 'Operator', label: 'Operator' },
    { value: 3, name: 'Parenthesis', label: 'Parenthesis' }
];
Enums.WidgetSizes = [
    { value: 0, name: 'ExtraSmall', label: 'Extra Small' },
    { value: 1, name: 'Small', label: 'Small' },
    { value: 2, name: 'Medium', label: 'Medium' },
    { value: 3, name: 'Large', label: 'Large' },
    { value: 4, name: 'ExtraLarge', label: 'Extra Large' },
    { value: 5, name: 'Maximum', label: 'Maximum' }
];
//# sourceMappingURL=enums.model.js.map