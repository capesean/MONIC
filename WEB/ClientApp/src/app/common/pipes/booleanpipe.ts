import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'booleanPipe',
    standalone: false
})
export class BooleanPipe implements PipeTransform {
    transform(value?: boolean, ...args: string[]): string {
        const yes = args[0] || "Yes";
        const no = args[1] || "No";
        const blank = args[2] || "";
        return value === true ? yes : (value === false ? no : blank);
    }
}
