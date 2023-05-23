import { Pipe, PipeTransform } from '@angular/core';
import { DateTypes } from '../models/enums.model';

@Pipe({
    name: 'frequencyAdverb'
})
export class FrequencyAdverb implements PipeTransform {
    transform(frequency: DateTypes): string {
        if (frequency === DateTypes.Month) return "Monthly";
        if (frequency === DateTypes.Quarter) return "Quarterly";
        if (frequency === DateTypes.Year) return "Annually";
        throw "Invalid DateType in FrequencyAdverb pipe";
    }
}
