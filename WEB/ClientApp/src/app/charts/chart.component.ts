import { Component, OnInit } from '@angular/core';
import { Indicator } from '../common/models/indicator.model';
import { EChartsOption } from 'echarts/types/dist/echarts';
import { UtilitiesService } from '../common/services/utilities.service';
import { IndicatorService } from '../common/services/indicator.service';
import { ChartData, ChartService } from '../common/services/chart.service';

class Settings {
    indicatorId: string;
    barColor: string;
    yAxisFontSize: number;
    xAxisFontSize: number;
    xAxisRotation: number;
}

@Component({
    selector: 'chart',
    templateUrl: './chart.component.html',
    standalone: false
})
export class ChartComponent implements OnInit {

    public settings = new Settings();

    public settingsObjects = {
        indicator: undefined as Indicator
    }

    public data: ChartData;

    public options: EChartsOption;

    private isInitializing = false;

    constructor(
        private utilitiesService: UtilitiesService,
        private indicatorService: IndicatorService,
        private chartService: ChartService
    ) { }

    ngOnInit() {

        this.setSettings({
            indicatorId: '112109ad-2021-4fa2-ab66-f3ea1a7fb728',
            barColor: '#156082',
            yAxisFontSize: 10,
            xAxisFontSize: 10,
            xAxisRotation: 45
        });
    }

    private setSettings(settings: Settings) {
        this.isInitializing = true;

        this.settings = settings;

        this.indicatorService.get(settings.indicatorId).subscribe(indicator => {
            this.settingsObjects.indicator = indicator

            this.isInitializing = false;
            this.loadData();  
        });
    }

    settingChanged() {
        if (this.isInitializing) return;
        this.loadData();
    }

    loadData() {
        this.chartService.getData(this.settings).subscribe(data => {
            this.data = data;
            this.updateChart();
        });
    }

    updateChart() {

        const formatter = this.utilitiesService.getFormatter(this.settingsObjects.indicator);
        
        this.options = {
            grid: {
                left: 50,
                right: 10,
                top: 10,
                bottom: 75
            },
            xAxis: {
                type: 'category',
                data: this.data.entities.map(o => o.name),
                axisLabel: {
                    fontSize: this.settings.xAxisFontSize,
                    rotate: this.settings.xAxisRotation,

                }
            },
            yAxis: {
                type: 'value',
                axisLabel: {
                    formatter: formatter,
                    fontSize: this.settings.yAxisFontSize
                },

            },
            series: [{
                name: this.settingsObjects.indicator.shortName ?? this.settingsObjects.indicator.name,
                type: "bar",
                data: this.data.entities.map(o => this.data.data.find(d => d.entityId === o.entityId)?.value),
                colorBy: this.settings.barColor ? undefined : "data",
                itemStyle: {
                    color: this.settings.barColor
                }
            }],
            tooltip: {
                trigger: 'axis',
                textStyle: {
                    fontSize: 10
                },
                axisPointer: {
                    type: 'cross',
                    crossStyle: {
                        color: 'red'
                    },
                    label: {
                        formatter: formatter
                    }
                },
                valueFormatter: formatter
            }
        } as EChartsOption;

    }

}
