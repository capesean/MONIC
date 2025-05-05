import { Pipe, PipeTransform } from '@angular/core';
import moment from 'moment';

@Pipe({
    name: 'momentPipe',
    standalone: false
})
export class MomentPipe implements PipeTransform {
    transform(value: Date | moment.Moment, ...args: string[]): string {
        if (value === undefined || value === null) return '';
        const [format] = args;
        if (format === "fromNow") return moment(value).fromNow();
        return moment(value).format(format);
    }
}
