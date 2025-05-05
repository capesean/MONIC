import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'fileSizePipe',
    standalone: false
})
export class FileSizePipe implements PipeTransform {
    transform(bytes: number, decimals = 2): string {
        if (!+bytes) return '0 bytes'

        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['bytes', 'kb', 'mb', 'gb', 'tb', 'pb', 'eb', 'zb', 'yb'];

        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
    }
}
