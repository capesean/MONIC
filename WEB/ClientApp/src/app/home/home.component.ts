import { Component, OnInit, ViewChild } from '@angular/core';
import { Enum, Enums, WidgetTypes } from '../common/models/enums.model';
import { ProfileModel } from '../common/models/profile.models';
import { FolderShortcutSettings, IndicatorBarChartSettings, IndicatorLineChartSettings, IndicatorMapSettings, IndicatorPieChartSettings, QuestionnaireBarChartSettings, WidgetSettings } from '../common/models/widget.model';
import { AuthService } from '../common/services/auth.service';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {

    public profile: ProfileModel;
    public widgetTypes = Enums.WidgetTypes;

    constructor(
        private authService: AuthService
    ) {
    }

    ngOnInit(): void {
        this.authService.getProfile()
            .subscribe(profile => this.profile = profile);
    }

    addWidget(widgetType: Enum): void {
        if (widgetType.value === WidgetTypes.FolderShortcut)
            this.profile.dashboardSettings.push(new FolderShortcutSettings(WidgetTypes.FolderShortcut));
        else if (widgetType.value === WidgetTypes.IndicatorBarChart)
            this.profile.dashboardSettings.push(new IndicatorBarChartSettings(WidgetTypes.IndicatorBarChart));
        else if (widgetType.value === WidgetTypes.IndicatorLineChart)
            this.profile.dashboardSettings.push(new IndicatorLineChartSettings(WidgetTypes.IndicatorLineChart));
        else if (widgetType.value === WidgetTypes.IndicatorMap)
            this.profile.dashboardSettings.push(new IndicatorMapSettings(WidgetTypes.IndicatorMap));
        else if (widgetType.value === WidgetTypes.IndicatorPieChart)
            this.profile.dashboardSettings.push(new IndicatorPieChartSettings(WidgetTypes.IndicatorPieChart));
        else if (widgetType.value === WidgetTypes.QuestionnaireBarChart)
            this.profile.dashboardSettings.push(new QuestionnaireBarChartSettings(WidgetTypes.QuestionnaireBarChart));
        else throw "Invalid widget type";
    }

}

