import { Pipe, PipeTransform } from '@angular/core';
import { Sizes } from '../models/enums.model';
import { Field } from '../models/field.model';

@Pipe({
    name: 'fieldSizePipe'
})
export class FieldSizePipe implements PipeTransform {
    transform(field: Field): string {
        if (field.size === Sizes.Small) return "col-sm-4 col-md-3 col-lg-2 col-xl-2";
        if (field.size === Sizes.Medium) return "col-sm-12 col-md-6 col-lg-4 col-xl-3";
        if (field.size === Sizes.Large) return "col-sm-12 col-md-12 col-lg-6 col-xl-4";
        if (field.size === Sizes.ExtraLarge) return "col-sm-12 col-md-12 col-lg-12 col-xl-6";
        if (field.size === Sizes.Full) return "col-sm-12";
        throw "invalid size in FieldSizePipe"

    }
}
