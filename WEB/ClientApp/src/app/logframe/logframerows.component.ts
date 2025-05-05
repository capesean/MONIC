import { Component, EventEmitter, Input, Output, ViewEncapsulation } from "@angular/core";
import { LogFrameRow } from "../common/models/logframerow.model";

@Component({
    selector: 'app-logframerows',
    templateUrl: './logframerows.component.html',
    styleUrls: ['./logframerows.component.css'],
    encapsulation: ViewEncapsulation.None,
    standalone: false
})
export class LogFrameRowsComponent {

    @Input() rows: LogFrameRow[] = [];

    @Output() rowClick = new EventEmitter<LogFrameRow>();

    public rowClicked(row?: LogFrameRow): void {
        this.rowClick.emit(row);
    }
}
