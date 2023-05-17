import { Component as NgComponent, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Date } from '../models/date.model';
import { Enums, WidgetTypes } from '../models/enums.model';
import { Indicator } from '../models/indicator.model';
import { FolderShortcutSettings, IndicatorBarChartSettings } from '../models/widget.model';
import { AuthService } from '../services/auth.service';
import { DateService } from '../services/date.service';
import { ErrorService } from '../services/error.service';
import { FolderService, FolderView } from '../services/folder.service';
import { IndicatorService } from '../services/indicator.service';

@NgComponent({
    selector: 'app-folder-shortcut-settings',
    templateUrl: './folder.shortcut.settings.component.html'
})
export class FolderShortcutSettingsComponent implements OnInit {

    public settings: FolderShortcutSettings;
    public widgetSizes = Enums.WidgetSizes;

    public folderView: FolderView;

    constructor(
        private errorService: ErrorService,
        public modal: NgbActiveModal,
        private folderService: FolderService,
        private toastr: ToastrService,
        private authService: AuthService
    ) {
    }

    ngOnInit(): void {
        if (this.settings.folderId)
            this.folderService.view(this.settings.folderId).subscribe(o => this.folderView = o);
    }

    save(form: NgForm): void {

        if (form.invalid) {

            this.toastr.error("The form has not been completed correctly.", "Form Error");
            return;

        }

        this.settings.widgetType = WidgetTypes.FolderShortcut;

        this.authService.saveDashboardSettings(this.settings)
            .subscribe({
                next: () => {
                    this.modal.close();
                },
                error: err => {
                    this.errorService.handleError(err, "Dashboard Settings", "Save");
                }
            });

    }
}
