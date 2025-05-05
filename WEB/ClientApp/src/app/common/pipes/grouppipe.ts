import { Pipe, PipeTransform } from '@angular/core';
import { Field } from '../models/field.model';

@Pipe({
    name: 'groupPipe',
    standalone: false
})
export class GroupPipe implements PipeTransform {
    transform(fields: Field[], groupId: string): Field[] {
        return fields.filter(o => o.groupId === groupId);
    }
}
