import { Component, OnInit, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';
import { ErrorService } from '../common/services/error.service';
import { EntityType } from '../common/models/entitytype.model';
import { ToolsService } from '../common/services/tools.service';
import { ImportService } from '../common/services/import.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ImportError } from '../common/models/import.model';
import { DownloadService } from '../common/services/download.service';
import { Indicator } from '../common/models/indicator.model';
import { Entity } from '../common/models/entity.model';
import { Date } from '../common/models/date.model';

@Component({
    selector: 'tools',
    templateUrl: './tools.component.html'
})
export class ToolsComponent implements OnInit {

    @ViewChild("csvModal") csvModal: any
    public csvErrors: ImportError[];

    public geoJson = {
        entityTypeId: undefined as string,
        entityType: undefined as EntityType,
        fileName: undefined as string,
        fileContents: undefined as string
    };

    public importCSVSettings = {
        fileName: undefined as string,
        fileContents: undefined as string
    };

    public exportCSVSettings = {
        indicatorIds: [] as string[],
        indicators: [] as Indicator[],
        entityIds: [] as string[],
        entities: [] as Entity[],
        dateIds: [] as string[],
        dates: [] as Date[]
    };

    constructor(
        private toastr: ToastrService,
        private errorService: ErrorService,
        private toolsService: ToolsService,
        private importService: ImportService,
        private modalService: NgbModal,
        private downloadService: DownloadService
    ) { }

    ngOnInit() {
    }

    uploadGeoJSON(form: NgForm) {

        if (form.invalid) {

            this.toastr.error("The form has not been completed correctly.");
            return;

        }

        if (!this.geoJson.fileName.endsWith(".json")) {
            this.toastr.error("The file should have a '.json' extension.");
            return;
        }

        this.toolsService.uploadGeoJson(this.geoJson.entityTypeId, this.geoJson.fileContents)
            .subscribe({
                next: () => {
                    this.toastr.success(`The GeoJSON ${this.geoJson.entityType.name} file has been uploaded`);
                    this.geoJson = { entityType: undefined, entityTypeId: undefined, fileContents: undefined, fileName: undefined };
                    form.resetForm();
                    form.reset();
                },
                error: err => this.errorService.handleError(err, "GeoJSON", "Upload")
            });

    }

    importCSV(form: NgForm) {

        if (form.invalid) {

            this.toastr.error("The form has not been completed correctly.");
            return;

        }

        if (!this.importCSVSettings.fileName.endsWith(".csv")) {
            this.toastr.error("The file should have a '.csv' extension.");
            return;
        }

        this.importService.importCSV(this.importCSVSettings.fileContents)
            .subscribe({
                next: () => {
                    this.toastr.success(`The CSV file has been imported`);
                    this.importCSVSettings = { fileContents: undefined, fileName: undefined };
                    form.resetForm();
                    form.reset();
                },
                error: err => {
                    if (Array.isArray(err.error) && err.error.length) {
                        this.csvErrors = err.error;
                        this.modalService.open(this.csvModal, { size: 'xl', centered: true, scrollable: true });
                    }
                    else {
                        this.errorService.handleError(err, "CSV", "Import")
                    }
                }
            })

    }

    exportCSV(form: NgForm) {

        if (form.invalid) {

            this.toastr.error("The form has not been completed correctly.");
            return;

        }

        this.downloadService.exportCSV(this.exportCSVSettings.indicatorIds, this.exportCSVSettings.entityIds, this.exportCSVSettings.dateIds)
            .subscribe({
                next: () => {
                },
                error: err => {
                    if (Array.isArray(err.error) && err.error.length) {
                        this.csvErrors = err.error;
                        this.modalService.open(this.csvModal, { size: 'xl', centered: true, scrollable: true });
                    }
                    else {
                        this.errorService.handleError(err, "CSV", "Export")
                    }
                }
            });

    }
}
