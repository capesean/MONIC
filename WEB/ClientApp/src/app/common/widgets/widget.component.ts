import { ChangeDetectorRef } from '@angular/core';
import { Component, EventEmitter, HostBinding, Input, OnInit, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Enums, WidgetSizes, WidgetTypes } from '../models/enums.model';
import { FolderShortcutSettings, IndicatorBarChartSettings, IndicatorLineChartSettings, IndicatorMapSettings, IndicatorPieChartSettings, QuestionnaireBarChartSettings, WidgetSettings } from '../models/widget.model';
import { AuthService } from '../services/auth.service';
import { FolderShortcutComponent } from './folder.shortcut.component';
import { FolderShortcutSettingsComponent } from './folder.shortcut.settings.component';
import { IndicatorBarChartComponent } from './indicator.barchart.component';
import { IndicatorBarChartSettingsComponent } from './indicator.barchart.settings.component';
import { IndicatorLineChartComponent } from './indicator.linechart.component';
import { IndicatorLineChartSettingsComponent } from './indicator.linechart.settings.component';
import { IndicatorMapComponent } from './indicator.map.component';
import { IndicatorMapSettingsComponent } from './indicator.map.settings.component';
import { IndicatorPieChartComponent } from './indicator.piechart.component';
import { IndicatorPieChartSettingsComponent } from './indicator.piechart.settings.component';
import { QuestionnaireBarChartComponent } from './questionnaire.barchart.component';
import { QuestionnaireBarChartSettingsComponent } from './questionnaire.barchart.settings.component';

@Component({
    selector: 'app-widget',
    templateUrl: './widget.component.html',
    standalone: false
}) export class WidgetComponent implements OnInit {

    public error = false;
    public loading = true;
    public title: string;
    public subtitle: string;

    @HostBinding('class.d-flex') dflex = true;
    @HostBinding('class.widget') widget = true;
    @HostBinding('class.deleted') deleted = false;
    @HostBinding('class.shrink') shrink = false;

    @HostBinding('class.col-12') col12 = true;

    @HostBinding('class.col-sm-4') colsm4 = false;
    @HostBinding('class.col-sm-8') colsm8 = false;

    @HostBinding('class.col-md-6') colmd6 = false;
    @HostBinding('class.col-md-8') colmd8 = false;
    @HostBinding('class.col-md-6') colmd9 = false;

    @HostBinding('class.col-lg-3') collg3 = false;
    @HostBinding('class.col-lg-4') collg4 = false;
    @HostBinding('class.col-lg-6') collg6 = false;
    @HostBinding('class.col-lg-8') collg8 = false;
    @HostBinding('class.col-lg-9') collg9 = false;

    @HostBinding('class.col-xl-3') colxl3 = false;
    @HostBinding('class.col-xl-4') colxl4 = false;
    @HostBinding('class.col-xl-6') colxl6 = false;
    @HostBinding('class.col-xl-8') colxl8 = false;
    @HostBinding('class.col-xl-9') colxl9 = false;

    @HostBinding('class.extra-small') extraSmall = false;
    @HostBinding('class.small') small = false;
    @HostBinding('class.medium') medium = false;
    @HostBinding('class.large') large = false;
    @HostBinding('class.extra-large') extraLarge = false;

    @Input() settings: WidgetSettings | IndicatorMapSettings | IndicatorLineChartSettings | IndicatorBarChartSettings | IndicatorPieChartSettings | FolderShortcutSettings;

    @ViewChild('indicatorMap') indicatorMap: IndicatorMapComponent;
    @ViewChild('indicatorLineChart') indicatorLineChart: IndicatorLineChartComponent;
    @ViewChild('indicatorBarChart') indicatorBarChart: IndicatorBarChartComponent;
    @ViewChild('indicatorPieChart') indicatorPieChart: IndicatorPieChartComponent;
    @ViewChild('questionnaireBarChart') questionnaireBarChart: QuestionnaireBarChartComponent;
    @ViewChild('folderShortcut') folderShortcut: FolderShortcutComponent;

    widgetTypes = WidgetTypes;

    constructor(
        private modalService: NgbModal,
        private authService: AuthService,
        private toastr: ToastrService,
        private cdref: ChangeDetectorRef
    ) {
    }

    public ngOnInit(): void {
        // validate

        if (!Enums.WidgetTypes.find(o => o.value === this.settings.widgetType)) {
            this.toastr.error(`Invalid Widget Type (${this.settings.widgetType}) in Widget Configuration`);
            return;
        }
        this.setSize();
    }

    private resetWidths(): void {
        this.colsm4 = false;
        this.colsm8 = false;

        this.colmd6 = false;
        this.colmd8 = false;
        this.colmd9 = false;

        this.collg3 = false;
        this.collg4 = false;
        this.collg6 = false;
        this.collg8 = false;
        this.collg9 = false;

        this.colxl3 = false;
        this.colxl4 = false;
        this.colxl6 = false;
        this.colxl8 = false;
        this.colxl9 = false;
    }

    ngAfterViewInit(): void {
        // prevent ExpressionChangedAfterItHasBeenCheckedError when child component emits changes to error, loading
        this.cdref.detectChanges();
    }

    private setSize(): void {
        this.resetWidths();
        if (this.settings.width === WidgetSizes.ExtraSmall) {
            this.colsm4 = true;
            this.colmd6 = true;
            this.collg4 = true;
            this.colxl3 = true;
        } else if (this.settings.width === WidgetSizes.Small) {
            this.colsm8 = true;
            this.colmd8 = true;
            this.collg6 = true;
            this.colxl4 = true;
        } else if (this.settings.width === WidgetSizes.Medium) {
            this.colmd9 = true;
            this.collg8 = true;
            this.colxl6 = true;
        } else if (this.settings.width === WidgetSizes.Large) {
            this.collg9 = true;
            this.colxl8 = true;
        } else if (this.settings.width === WidgetSizes.ExtraLarge) {
            this.colxl9 = true;
        } else if (this.settings.width === WidgetSizes.Maximum) {
            // leave .col-12 only
        } else {
            // defaults...
            this.colsm4 = true;
            this.colmd6 = true;
            this.collg4 = true;
        }
        if (this.settings.height != null) {
            this.extraSmall = this.settings.height === WidgetSizes.ExtraSmall;
            this.small = this.settings.height === WidgetSizes.Small;
            this.medium = this.settings.height === WidgetSizes.Medium;
            this.large = this.settings.height === WidgetSizes.Large;
            this.extraLarge = this.settings.height === WidgetSizes.ExtraLarge;
        }
    }

    public openSettings(): void {

        if (this.settings.widgetType === WidgetTypes.IndicatorMap) {
            let modalRef = this.modalService.open(IndicatorMapSettingsComponent, { centered: true, scrollable: false });
            (modalRef.componentInstance as IndicatorMapSettingsComponent).settings = this.settings as IndicatorMapSettings;
            modalRef.result.then(
                () => {

                    this.setSize();
                    this.indicatorMap.load();

                }, () => { });
        } else if (this.settings.widgetType === WidgetTypes.IndicatorLineChart) {
            let modalRef = this.modalService.open(IndicatorLineChartSettingsComponent, { centered: true, scrollable: false });
            (modalRef.componentInstance as IndicatorLineChartSettingsComponent).settings = this.settings as IndicatorLineChartSettings;
            modalRef.result.then(
                () => {

                    this.setSize();
                    this.indicatorLineChart.load();

                }, () => { });
        } else if (this.settings.widgetType === WidgetTypes.IndicatorBarChart) {
            let modalRef = this.modalService.open(IndicatorBarChartSettingsComponent, { centered: true, scrollable: false });
            (modalRef.componentInstance as IndicatorBarChartSettingsComponent).settings = this.settings as IndicatorBarChartSettings;
            modalRef.result.then(
                () => {

                    this.setSize();
                    this.indicatorBarChart.load();

                }, () => { });
        } else if (this.settings.widgetType === WidgetTypes.IndicatorPieChart) {
            let modalRef = this.modalService.open(IndicatorPieChartSettingsComponent, { centered: true, scrollable: false });
            (modalRef.componentInstance as IndicatorPieChartSettingsComponent).settings = this.settings as IndicatorPieChartSettings;
            modalRef.result.then(
                () => {

                    this.indicatorPieChart.load();
                    this.setSize();

                }, () => { });
        } else if (this.settings.widgetType === WidgetTypes.QuestionnaireBarChart) {
            let modalRef = this.modalService.open(QuestionnaireBarChartSettingsComponent, { centered: true, scrollable: false });
            (modalRef.componentInstance as QuestionnaireBarChartSettingsComponent).settings = this.settings as QuestionnaireBarChartSettings;
            modalRef.result.then(
                () => {

                    this.setSize();
                    this.questionnaireBarChart.load();

                }, () => { });
        } else if (this.settings.widgetType === WidgetTypes.FolderShortcut) {
            let modalRef = this.modalService.open(FolderShortcutSettingsComponent, { centered: true, scrollable: false });
            (modalRef.componentInstance as FolderShortcutSettingsComponent).settings = this.settings as FolderShortcutSettings;
            modalRef.result.then(
                () => {

                    this.setSize();
                    this.folderShortcut.load();

                }, () => { });
        } else {
            throw "Unhandled widgetType: " + this.settings.widgetType;
        }
    }

    public remove(): void {
        this.deleted = true;
        setTimeout(() => this.shrink = true, 1000);
        setTimeout(() => {
            this.authService.saveDashboardSettings(this.settings, true)
                .subscribe({
                    error: () => {
                        this.deleted = false;
                        this.shrink = false;
                    }
                });
        }, 2000);
    }

}

