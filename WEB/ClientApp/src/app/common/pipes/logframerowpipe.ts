import { Pipe, PipeTransform } from '@angular/core';
import { ComponentTypes, LogFrameRowTypes } from '../models/enums.model';
import { LogFrameRow } from '../models/logframerow.model';

@Pipe({
    name: 'logFrameRowPipe'
})
export class LogFrameRowPipe implements PipeTransform {
    transform(rows: LogFrameRow[], type: LogFrameRowTypes): LogFrameRow[] {
        return rows.filter(o => o.rowType === type);
    }
}
