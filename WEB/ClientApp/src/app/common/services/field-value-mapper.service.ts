// services/field-value-mapper.service.ts
import { Injectable } from '@angular/core';
import { FieldTypes } from '../models/enums.model';
import { Field } from '../models/field.model';
import { IHasFields } from '../models/ihasfields.model';
import { Item } from '../models/item.model';
import { ItemField } from '../models/itemfield.model';
import { ItemOption } from '../models/itemoption.model';
import { FieldValue, ItemFieldMap } from '../models/fieldvalue.model';
import moment from 'moment';

@Injectable({ providedIn: 'root' })
export class FieldValueMapperService {

    mapItemToFields(itemObject: IHasFields, fields: Field[]): ItemFieldMap {
        const map: ItemFieldMap = new Map();

        fields.forEach(field => {
            if (field.fieldType === FieldTypes.OptionList) {
                const optionIds = field.optionList.options.map(o => o.optionId);

                if (field.multiple) {
                    const values = itemObject.itemOptions
                        .filter(o => o.fieldId === field.fieldId && optionIds.includes(o.optionId))
                        .map(o => o.optionId);
                    map.set(field.fieldId, values);
                } else {
                    const value = itemObject.itemOptions.find(o =>
                        o.fieldId === field.fieldId && optionIds.includes(o.optionId)
                    )?.optionId;
                    map.set(field.fieldId, value);
                }
            }
            else if (field.fieldType === FieldTypes.Date) {
                const value = itemObject.itemFields.find(o => o.fieldId === field.fieldId)?.value;
                map.set(field.fieldId, value ? new Date(value) : undefined);
            }
            else if (field.fieldType === FieldTypes.Text) {
                map.set(field.fieldId, itemObject.itemFields.find(o => o.fieldId === field.fieldId)?.value);
            }
            else if (field.fieldType === FieldTypes.YesNo) {
                const raw = itemObject.itemFields.find(o => o.fieldId === field.fieldId)?.value;
                map.set(field.fieldId, raw === "Yes");
            }
            else {
                throw new Error(`Unhandled fieldType in mapItemToFields: ${field.fieldType}`);
            }
        });

        return map;
    }

    mapFieldsToItem(itemFields: ItemFieldMap, fields: Field[], item: Item): IHasFields {
        const result: IHasFields = { itemFields: [], itemOptions: [] };

        fields.forEach(field => {
            const value = itemFields.get(field.fieldId);
            if (!value || (Array.isArray(value) && value.length === 0)) return;

            if (field.fieldType === FieldTypes.OptionList) {
                if (field.multiple) {
                    (value as string[]).forEach(o =>
                        result.itemOptions.push({ itemId: item.itemId, fieldId: field.fieldId, optionId: o } as ItemOption)
                    );
                } else {
                    result.itemOptions.push({ itemId: item.itemId, fieldId: field.fieldId, optionId: value as string } as ItemOption);
                }
            }
            else if (field.fieldType === FieldTypes.Date) {
                result.itemFields.push({ itemId: item.itemId, fieldId: field.fieldId, value: moment(value as Date).format("DD MMMM YYYY") } as ItemField);
            }
            else if (field.fieldType === FieldTypes.Text) {
                result.itemFields.push({ itemId: item.itemId, fieldId: field.fieldId, value: value as string } as ItemField);
            }
            else if (field.fieldType === FieldTypes.YesNo) {
                result.itemFields.push({ itemId: item.itemId, fieldId: field.fieldId, value: (value === true ? "Yes" : "No") } as ItemField);
            }
            else {
                throw new Error(`Unhandled fieldType in mapFieldsToItem: ${field.fieldType}`);
            }
        });

        return result;
    }
}
