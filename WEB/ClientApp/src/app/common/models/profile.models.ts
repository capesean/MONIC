import { IndicatorPermission } from "./indicatorpermission.model";
import { Organisation } from "./organisation.model";
import { FolderShortcutSettings, IndicatorBarChartSettings, IndicatorLineChartSettings, IndicatorMapSettings, IndicatorPieChartSettings, WidgetSettings } from "./widget.model";

export interface ProfileModel {
    firstName: string;
    lastName: string;
    fullName: string;
    userId: string;
    userName: string;
    email: string;
    organisationId: string;
    organisation: Organisation;
    entityIds: string[];
    indicatorPermissions: IndicatorPermission[];
    dashboardSettings: (WidgetSettings | IndicatorMapSettings | IndicatorLineChartSettings | IndicatorBarChartSettings | IndicatorPieChartSettings | FolderShortcutSettings)[]
}

